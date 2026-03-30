import { eq, and, avg, count, inArray, sql } from "drizzle-orm";
import { db } from "~/db";
import { courseRatings } from "~/db/schema";

// ─── Rating Service ───
// Handles course star ratings (1–5). One rating per user per course, upsertable.
// Uses positional parameters (project convention).

export function getCourseRatingByUser(userId: number, courseId: number) {
  return db
    .select()
    .from(courseRatings)
    .where(
      and(
        eq(courseRatings.userId, userId),
        eq(courseRatings.courseId, courseId)
      )
    )
    .get();
}

export function upsertCourseRating(
  userId: number,
  courseId: number,
  rating: number
) {
  return db
    .insert(courseRatings)
    .values({ userId, courseId, rating })
    .onConflictDoUpdate({
      target: [courseRatings.userId, courseRatings.courseId],
      set: { rating },
    })
    .returning()
    .get();
}

export function getAverageRatingForCourse(courseId: number) {
  const result = db
    .select({
      average: avg(courseRatings.rating),
      count: count(courseRatings.id),
    })
    .from(courseRatings)
    .where(eq(courseRatings.courseId, courseId))
    .get();

  return {
    average: result?.average != null ? Number(result.average) : null,
    count: result?.count ?? 0,
  };
}

export function getAverageRatingsForCourses(
  courseIds: number[]
): Map<number, { average: number; count: number }> {
  if (courseIds.length === 0) return new Map();

  const rows = db
    .select({
      courseId: courseRatings.courseId,
      average: avg(courseRatings.rating),
      count: count(courseRatings.id),
    })
    .from(courseRatings)
    .where(inArray(courseRatings.courseId, courseIds))
    .groupBy(courseRatings.courseId)
    .all();

  const map = new Map<number, { average: number; count: number }>();
  for (const row of rows) {
    if (row.average != null) {
      map.set(row.courseId, {
        average: Number(row.average),
        count: row.count,
      });
    }
  }
  return map;
}
