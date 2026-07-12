package com.ympf.portfolio.resume.pdf;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.ympf.portfolio.common.exception.ApiException;
import com.ympf.portfolio.profile.Profile;
import com.ympf.portfolio.resume.ResumeDtos.ResumeDetailResponse;

@Component
public class ResumePdfRenderer {
	private static final float MARGIN = 48; private static final float BODY_SIZE = 10; private static final float LEADING = 15;
	private final ResumePdfProperties properties;
	public ResumePdfRenderer(ResumePdfProperties properties) { this.properties = properties; }

	public byte[] render(ResumeDetailResponse resume, Profile profile) {
		Path fontPath = resolveFont();
		try (PDDocument document = new PDDocument()) {
			PDType0Font font = PDType0Font.load(document, fontPath.toFile());
			Writer writer = new Writer(document, font);
			writer.heading(profile.getName(), 20); writer.text(profile.getHeadline());
			writer.text(profile.getEmail()); writer.space(8);
			writer.heading(resume.positionName() + " · " + resume.companyName(), 14);
			writer.text(resume.customSummary());
			if (!resume.skills().isEmpty()) { writer.space(8); writer.heading("Skills", 13); writer.text(resume.skills().stream().map(item -> item.name()).reduce((a, b) -> a + " · " + b).orElse("")); }
			if (!resume.experiences().isEmpty()) { writer.space(8); writer.heading("Experience", 13); for (var item : resume.experiences()) { writer.heading(item.organization() + " · " + item.title(), 11); writer.text(item.startDate() + " — " + (item.current() ? "현재" : item.endDate())); writer.text(item.description()); writer.space(5); } }
			if (!resume.projects().isEmpty()) { writer.space(8); writer.heading("Projects", 13); for (var item : resume.projects()) { writer.heading(item.title(), 11); writer.text(item.summary()); if (item.results() != null) writer.text(item.results()); writer.space(5); } }
			writer.close(); ByteArrayOutputStream output = new ByteArrayOutputStream(); document.save(output); return output.toByteArray();
		} catch (IOException | IllegalArgumentException exception) {
			throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "RESUME_PDF_GENERATION_FAILED", "Resume PDF could not be generated", exception);
		}
	}

	private Path resolveFont() {
		List<Path> candidates = new ArrayList<>(); if (!properties.fontPath().isBlank()) candidates.add(Path.of(properties.fontPath()));
		candidates.add(Path.of("C:/Windows/Fonts/malgun.ttf")); candidates.add(Path.of("/usr/share/fonts/truetype/nanum/NanumGothic.ttf"));
		return candidates.stream().filter(Files::isRegularFile).findFirst().orElseThrow(() -> new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "RESUME_PDF_FONT_UNAVAILABLE", "Configure RESUME_PDF_FONT_PATH with a Korean TrueType font"));
	}

	private static final class Writer {
		private final PDDocument document; private final PDType0Font font; private PDPage page; private PDPageContentStream stream; private float y;
		Writer(PDDocument document, PDType0Font font) throws IOException { this.document = document; this.font = font; newPage(); }
		void heading(String value, float size) throws IOException { lines(value, size, size + 6); }
		void text(String value) throws IOException { if (value != null && !value.isBlank()) lines(value, BODY_SIZE, LEADING); }
		void space(float amount) { y -= amount; }
		void lines(String value, float size, float leading) throws IOException { for (String paragraph : value.replace("\r", "").split("\n", -1)) { for (String line : wrap(paragraph, size)) { ensureSpace(leading); stream.beginText(); stream.setFont(font, size); stream.newLineAtOffset(MARGIN, y); stream.showText(line); stream.endText(); y -= leading; } } }
		List<String> wrap(String text, float size) throws IOException { if (text.isBlank()) return List.of(" "); List<String> result = new ArrayList<>(); StringBuilder line = new StringBuilder(); for (String token : text.split("(?<=\\s)|(?=\\s)")) { String candidate = line + token; if (font.getStringWidth(candidate) / 1000 * size > PDRectangle.A4.getWidth() - MARGIN * 2 && !line.isEmpty()) { result.add(line.toString().stripTrailing()); line = new StringBuilder(token.stripLeading()); } else line.append(token); } if (!line.isEmpty()) result.add(line.toString().stripTrailing()); return result; }
		void ensureSpace(float needed) throws IOException { if (y - needed < MARGIN) newPage(); }
		void newPage() throws IOException { if (stream != null) stream.close(); page = new PDPage(PDRectangle.A4); document.addPage(page); stream = new PDPageContentStream(document, page); y = page.getMediaBox().getHeight() - MARGIN; }
		void close() throws IOException { if (stream != null) stream.close(); }
	}
}
