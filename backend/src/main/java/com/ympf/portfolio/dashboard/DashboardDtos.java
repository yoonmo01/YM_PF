package com.ympf.portfolio.dashboard;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class DashboardDtos {
	private DashboardDtos() {}
	public record RecentItem(String type, UUID id, String title, Instant updatedAt) {}
	public record DashboardResponse(long publishedProjectCount, long draftProjectCount,
			long mediaFileCount, long resumeCount, List<RecentItem> recentItems) {}
}
