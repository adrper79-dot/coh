import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/auth';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  contentType: 'video' | 'text' | 'quiz';
  videoUrl: string | null;
  textContent: string | null;
  durationMinutes: number | null;
  sortOrder: number;
  isFree: boolean;
  completed?: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  modules: Module[];
}

const API = import.meta.env.VITE_API_URL ?? 'https://cypher-of-healing-api.workers.dev';

export default function LessonPage() {
  const { courseSlug, lessonId } = useParams<{ courseSlug: string; lessonId: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchCourse = useCallback(async () => {
    if (!courseSlug || !token) return;
    try {
      const res = await fetch(`${API}/api/academy/courses/${courseSlug}`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to load course');
      const data = await res.json();
      setCourse(data.course);

      // Set the current lesson from URL param, or default to first lesson
      const allLessons = data.course.modules.flatMap((m: Module) => m.lessons);
      const target = lessonId
        ? allLessons.find((l: Lesson) => l.id === lessonId)
        : allLessons[0];
      setCurrentLesson(target ?? null);
    } catch (err) {
      setError('Unable to load course content. Please try again.');
    }
  }, [courseSlug, lessonId, token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCourse();
  }, [fetchCourse, token, navigate]);

  // Update current lesson when URL lessonId changes
  useEffect(() => {
    if (!course || !lessonId) return;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const target = allLessons.find((l) => l.id === lessonId);
    if (target) setCurrentLesson(target);
  }, [lessonId, course]);

  const markComplete = async () => {
    if (!currentLesson || markingComplete) return;
    setMarkingComplete(true);
    try {
      await fetch(`${API}/api/academy/lessons/${currentLesson.id}/complete`, {
        method: 'POST',
        headers: authHeaders,
      });
      setCurrentLesson((prev) => (prev ? { ...prev, completed: true } : prev));

      // Navigate to next lesson
      const allLessons = course?.modules.flatMap((m) => m.lessons) ?? [];
      const idx = allLessons.findIndex((l) => l.id === currentLesson.id);
      if (idx < allLessons.length - 1) {
        navigate(`/academy/${courseSlug}/${allLessons[idx + 1].id}`);
      }
    } finally {
      setMarkingComplete(false);
    }
  };

  const allLessons = course?.modules.flatMap((m) => m.lessons) ?? [];
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center text-white">
          <p className="text-xl mb-4">{error}</p>
          <Link to="/academy" className="text-primary-400 underline">
            Back to Academy
          </Link>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Top bar */}
      <header className="bg-dark-900 border-b border-dark-700 px-4 py-3 flex items-center gap-4 flex-shrink-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-dark-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-dark-700"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link
          to="/academy"
          className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
        >
          ← The Academy
        </Link>
        <span className="text-dark-500 text-sm hidden md:block">/ {course.title}</span>
        <h1 className="text-white font-semibold text-sm ml-2 truncate">{currentLesson.title}</h1>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-dark-400 text-xs hidden md:block">
            {currentIndex + 1} of {allLessons.length}
          </span>
          {currentLesson.completed ? (
            <span className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-xs font-semibold">
              ✓ Completed
            </span>
          ) : (
            <button
              onClick={markComplete}
              disabled={markingComplete}
              className="px-4 py-1.5 bg-primary-500 text-white rounded-full text-xs font-semibold hover:bg-primary-400 transition-colors disabled:opacity-50"
            >
              {markingComplete ? 'Saving…' : 'Mark Complete'}
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="bg-dark-900 border-r border-dark-700 overflow-y-auto flex-shrink-0"
            >
              <div className="p-4 min-w-[320px]">
                <h2 className="text-white font-serif font-bold text-lg mb-4">{course.title}</h2>
                {course.modules.map((mod, mIdx) => (
                  <div key={mod.id} className="mb-6">
                    <div className="text-xs uppercase tracking-widest text-primary-500 font-bold mb-2 px-2">
                      Station {mIdx + 1}: {mod.title}
                    </div>
                    <div className="space-y-1">
                      {mod.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          to={`/academy/${courseSlug}/${lesson.id}`}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            lesson.id === currentLesson.id
                              ? 'bg-primary-600 text-white'
                              : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                          }`}
                        >
                          <span className="flex-shrink-0">
                            {lesson.completed ? (
                              <span className="text-green-400 text-xs">✓</span>
                            ) : lesson.contentType === 'video' ? (
                              <span className="text-xs">▶</span>
                            ) : (
                              <span className="text-xs">📄</span>
                            )}
                          </span>
                          <span className="truncate">{lesson.title}</span>
                          {lesson.durationMinutes && (
                            <span className="text-xs opacity-50 ml-auto flex-shrink-0">
                              {lesson.durationMinutes}m
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 md:p-10">

            {/* Video Player */}
            {currentLesson.contentType === 'video' && currentLesson.videoUrl && (
              <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-8 shadow-2xl">
                <iframe
                  src={currentLesson.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentLesson.title}
                />
              </div>
            )}

            {currentLesson.contentType === 'video' && !currentLesson.videoUrl && (
              <div className="aspect-video bg-dark-800 rounded-2xl flex items-center justify-center mb-8">
                <div className="text-center text-dark-400">
                  <div className="text-5xl mb-3">▶</div>
                  <p className="text-sm">Video content coming soon</p>
                </div>
              </div>
            )}

            {/* Lesson header */}
            <motion.div
              key={currentLesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs uppercase tracking-widest text-primary-500 font-bold">
                  {currentLesson.contentType}
                </span>
                {currentLesson.durationMinutes && (
                  <span className="text-dark-400 text-xs">· {currentLesson.durationMinutes} min</span>
                )}
              </div>
              <h2 className="text-3xl font-serif font-bold text-white mb-4">
                {currentLesson.title}
              </h2>
              {currentLesson.description && (
                <p className="text-dark-300 text-lg leading-relaxed mb-8">
                  {currentLesson.description}
                </p>
              )}

              {/* Text content */}
              {currentLesson.contentType === 'text' && currentLesson.textContent && (
                <div
                  className="prose prose-invert prose-lg max-w-none text-dark-200 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentLesson.textContent }}
                />
              )}
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-dark-700">
              {prevLesson ? (
                <Link
                  to={`/academy/${courseSlug}/${prevLesson.id}`}
                  className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors text-sm group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span>
                  <span className="truncate max-w-[200px]">{prevLesson.title}</span>
                </Link>
              ) : (
                <div />
              )}

              {!currentLesson.completed && (
                <button
                  onClick={markComplete}
                  disabled={markingComplete}
                  className="px-6 py-2.5 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-400 transition-colors disabled:opacity-50"
                >
                  {markingComplete ? 'Saving…' : nextLesson ? 'Complete & Continue →' : 'Complete Course ✓'}
                </button>
              )}

              {nextLesson ? (
                <Link
                  to={`/academy/${courseSlug}/${nextLesson.id}`}
                  className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors text-sm group"
                >
                  <span className="truncate max-w-[200px]">{nextLesson.title}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
