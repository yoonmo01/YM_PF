package com.ympf.portfolio.media;

import java.time.Duration;
import java.util.UUID;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/media")
public class PublicMediaController {
	private final MediaService service;
	public PublicMediaController(MediaService service) { this.service = service; }
	@GetMapping("/{id}/content") public ResponseEntity<byte[]> content(@PathVariable UUID id) { return AdminMediaController.response(service.content(id, true), CacheControl.maxAge(Duration.ofHours(1)).cachePublic()); }
}
