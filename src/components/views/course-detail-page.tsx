import { CourseDetailView } from '@/components/views/course-detail-view';
import type { Locale } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { getPublicCourses } from '@/lib/content-db';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

async function findCourse(slug: string) {
  const courses = await getPublicCourses();
  return courses.find((course) => course.slug === slug) ?? null;
}

export async function courseMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const course = await findCourse(slug);
  if (!course) return {};
  return { title: course.title[locale], description: course.summary[locale] };
}

export async function CourseDetailPage({ locale, slug }: { locale: Locale; slug: string }) {
  const course = await findCourse(slug);
  if (!course) notFound();
  const session = await auth();
  return (
    <CourseDetailView locale={locale} course={course} isSignedIn={Boolean(session?.user?.id)} />
  );
}
