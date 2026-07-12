package com.ympf.portfolio.media;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ympf.portfolio.common.validation.SafeText;
import com.ympf.portfolio.media.MediaDtos.AdminMediaResponse;
import com.ympf.portfolio.media.MediaDtos.MediaContent;
import com.ympf.portfolio.media.MediaDtos.MediaMetadataRequest;

@Validated
@RestController
@RequestMapping("/api/admin/media")
public class AdminMediaController {
	private final MediaService service;
	public AdminMediaController(MediaService service) { this.service = service; }
	@GetMapping public List<AdminMediaResponse> list() { return service.list(); }
	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<AdminMediaResponse> upload(@RequestPart MultipartFile file,
			@RequestParam @NotBlank @Size(max = 300) @SafeText String altText,
			@RequestParam(required = false) @Size(max = 1000) @SafeText String caption) {
		AdminMediaResponse response = service.upload(file, altText, caption);
		return ResponseEntity.created(URI.create("/api/admin/media/" + response.id())).body(response);
	}
	@PutMapping("/{id}") public AdminMediaResponse update(@PathVariable UUID id, @Valid @RequestBody MediaMetadataRequest request) { return service.update(id, request); }
	@DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable UUID id) { service.delete(id); return ResponseEntity.noContent().build(); }
	@GetMapping("/{id}/content") public ResponseEntity<byte[]> content(@PathVariable UUID id) { return response(service.content(id, false), CacheControl.noStore()); }
	static ResponseEntity<byte[]> response(MediaContent content, CacheControl cacheControl) { return ResponseEntity.ok().cacheControl(cacheControl).contentType(MediaType.parseMediaType(content.mimeType())).body(content.bytes()); }
}
