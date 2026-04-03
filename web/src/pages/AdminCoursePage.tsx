import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/auth';

interface CourseRow {
  id: string;
  title: string;
  slug: string;
  price: string;
  isPublished: boolean;
  totalModules: number;
  totalLessons: number;
  enrollmentCount: number;
  createdAt: string;
}

interface EnrollmentRow {
  enrollmentId: string;
  status: string;
  progressPercent: number;
  enrolledAt: string;
  courseTitle: string;
  userName: string;
  userEmail: string;
}

interface Analytics {
  totals: {
    totalCourses: number;
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
  };
  courseStats: Array<{
    courseId: string;
    courseTitle: string;
    enrollments: number;
    completions: number;
    avgProgress: number;
  }>;
}

const API = import.meta.env.VITE_API_URL ?? 'https://cypher-of-healing-api.workers.dev';

type TabId = 'overview' | 'courses' | 'students' | 'create';

export default function AdminCoursePage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create course form
  const [newCourse, setNewCourse] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    estimatedHours: '',
  });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    if (!token || user?.role !== 'admin') return;
    setLoading(true);
    try {
      const [analyticsRes, coursesRes, enrollmentsRes] = await Promise.all([
        fetch(`${API}/api/admin/analytics`, { headers: authHeaders }),
        fetch(`${API}/api/admin/courses`, { headers: authHeaders }),
        fetch(`${API}/api/admin/enrollments?limit=50`, { headers: authHeaders }),
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (coursesRes.ok) setCourses((await coursesRes.json()).courses ?? []);
      if (enrollmentsRes.ok) setEnrollments((await enrollmentsRes.json()).enrollments ?? []);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (user && user.role !== 'admin') { navigate('/'); return; }
    fetchData();
  }, [token, user, navigate, fetchData]);

  const togglePublish = async (course: CourseRow) => {
    setActionLoading(course.id);
    try {
      await fetch(`${API}/api/admin/courses/${course.id}/publish`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ publish: !course.isPublished }),
      });
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, isPublished: !course.isPublished } : c
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    if (!newCourse.title || !newCourse.slug || !newCourse.price) {
      setCreateError('Title, slug, and price are required.');
      return;
    }
    setActionLoading('create');
    try {
      const res = await fetch(`${API}/api/admin/courses`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newCourse),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to create course');
      }
      const data = await res.json();
      setCourses((prev) => [data.course, ...prev]);
      setCreateSuccess(`Course "${data.course.title}" created successfully!`);
      setNewCourse({ title: '', slug: '', description: '', shortDescription: '', price: '', estimatedHours: '' });
      setActiveTab('courses');
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const slugify = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Courses' },
    { id: 'students', label: 'Students' },
    { id: 'create', label: '+ New Course' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs text-primary-600 font-bold uppercase tracking-widest mb-1">
              Admin Panel
            </div>
            <h1 className="text-3xl font-serif font-bold text-dark-900">Course Administration</h1>
          </div>
          <Link
            to="/academy"
            className="text-sm text-dark-500 hover:text-dark-900 transition-colors"
          >
            ← View Academy
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-dark-200 rounded-xl p-1 mb-8 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-dark-600 hover:text-dark-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Total Courses', value: analytics.totals.totalCourses },
                { label: 'Total Enrollments', value: analytics.totals.totalEnrollments },
                { label: 'Active Students', value: analytics.totals.activeEnrollments },
                { label: 'Completions', value: analytics.totals.completedEnrollments },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-6 border border-dark-100">
                  <div className="text-3xl font-bold text-primary-500 mb-1">{stat.value ?? 0}</div>
                  <div className="text-dark-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Course stats table */}
            <div className="bg-white rounded-2xl border border-dark-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-dark-100">
                <h2 className="font-serif font-bold text-dark-900 text-lg">Per-Course Performance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-dark-50 text-dark-500 uppercase text-xs tracking-widest">
                    <tr>
                      <th className="text-left px-6 py-3">Course</th>
                      <th className="text-right px-6 py-3">Enrollments</th>
                      <th className="text-right px-6 py-3">Completions</th>
                      <th className="text-right px-6 py-3">Avg Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-50">
                    {analytics.courseStats.map((cs) => (
                      <tr key={cs.courseId} className="hover:bg-dark-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-dark-900">{cs.courseTitle}</td>
                        <td className="px-6 py-4 text-right text-dark-600">{cs.enrollments}</td>
                        <td className="px-6 py-4 text-right text-dark-600">{cs.completions}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-24 bg-dark-100 rounded-full h-1.5">
                              <div
                                className="bg-primary-500 h-1.5 rounded-full"
                                style={{ width: `${cs.avgProgress ?? 0}%` }}
                              />
                            </div>
                            <span className="text-dark-600 w-12 text-right">
                              {cs.avgProgress ?? 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {analytics.courseStats.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-dark-400">
                          No course data yet. Create and publish a course to see analytics.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl border border-dark-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-dark-100 flex items-center justify-between">
                <h2 className="font-serif font-bold text-dark-900 text-lg">All Courses</h2>
                <button
                  onClick={() => setActiveTab('create')}
                  className="text-sm bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors"
                >
                  + New Course
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-dark-50 text-dark-500 uppercase text-xs tracking-widest">
                    <tr>
                      <th className="text-left px-6 py-3">Title</th>
                      <th className="text-right px-6 py-3">Price</th>
                      <th className="text-right px-6 py-3">Modules</th>
                      <th className="text-right px-6 py-3">Lessons</th>
                      <th className="text-right px-6 py-3">Enrolled</th>
                      <th className="text-center px-6 py-3">Status</th>
                      <th className="text-right px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-50">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-dark-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-dark-900">{course.title}</div>
                          <div className="text-dark-400 text-xs mt-0.5">/{course.slug}</div>
                        </td>
                        <td className="px-6 py-4 text-right text-dark-700">${course.price}</td>
                        <td className="px-6 py-4 text-right text-dark-600">{course.totalModules}</td>
                        <td className="px-6 py-4 text-right text-dark-600">{course.totalLessons}</td>
                        <td className="px-6 py-4 text-right text-dark-600">{course.enrollmentCount}</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              course.isPublished
                                ? 'bg-green-100 text-green-700'
                                : 'bg-dark-100 text-dark-500'
                            }`}
                          >
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/academy/${course.slug}`}
                              className="text-xs text-primary-600 hover:underline"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => togglePublish(course)}
                              disabled={actionLoading === course.id}
                              className="text-xs px-3 py-1.5 border border-dark-200 rounded-lg hover:bg-dark-50 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === course.id
                                ? '…'
                                : course.isPublished
                                ? 'Unpublish'
                                : 'Publish'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-dark-400">
                          No courses yet.{' '}
                          <button
                            onClick={() => setActiveTab('create')}
                            className="text-primary-600 underline"
                          >
                            Create your first course
                          </button>
                          .
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl border border-dark-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-dark-100">
                <h2 className="font-serif font-bold text-dark-900 text-lg">Recent Enrollments</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-dark-50 text-dark-500 uppercase text-xs tracking-widest">
                    <tr>
                      <th className="text-left px-6 py-3">Student</th>
                      <th className="text-left px-6 py-3">Course</th>
                      <th className="text-center px-6 py-3">Status</th>
                      <th className="text-right px-6 py-3">Progress</th>
                      <th className="text-right px-6 py-3">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-50">
                    {enrollments.map((e) => (
                      <tr key={e.enrollmentId} className="hover:bg-dark-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-dark-900">{e.userName}</div>
                          <div className="text-dark-400 text-xs">{e.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-dark-700">{e.courseTitle}</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              e.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : e.status === 'completed'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-dark-100 text-dark-500'
                            }`}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-dark-100 rounded-full h-1.5">
                              <div
                                className="bg-primary-500 h-1.5 rounded-full"
                                style={{ width: `${e.progressPercent}%` }}
                              />
                            </div>
                            <span className="text-dark-500 text-xs w-8 text-right">
                              {e.progressPercent}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-dark-400 text-xs">
                          {new Date(e.enrolledAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {enrollments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-dark-400">
                          No enrollments yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Create Course Tab */}
        {activeTab === 'create' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl border border-dark-100 p-8">
                <h2 className="font-serif font-bold text-dark-900 text-2xl mb-6">
                  Create New Course
                </h2>

                {createError && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                    {createError}
                  </div>
                )}
                {createSuccess && (
                  <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
                    {createSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateCourse} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-1.5">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={newCourse.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewCourse((p) => ({
                          ...p,
                          title: val,
                          slug: p.slug || slugify(val),
                        }));
                      }}
                      placeholder="The Cipher of Healing"
                      className="w-full px-4 py-3 border border-dark-200 rounded-xl text-dark-900 focus:outline-none focus:border-primary-400 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-1.5">
                      URL Slug *
                    </label>
                    <div className="flex items-center border border-dark-200 rounded-xl overflow-hidden focus-within:border-primary-400 transition-colors">
                      <span className="px-3 py-3 text-dark-400 text-sm bg-dark-50 border-r border-dark-200">
                        /academy/
                      </span>
                      <input
                        type="text"
                        value={newCourse.slug}
                        onChange={(e) =>
                          setNewCourse((p) => ({ ...p, slug: slugify(e.target.value) }))
                        }
                        placeholder="cipher-of-healing"
                        className="flex-1 px-4 py-3 text-dark-900 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-1.5">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={newCourse.shortDescription}
                      onChange={(e) =>
                        setNewCourse((p) => ({ ...p, shortDescription: e.target.value }))
                      }
                      placeholder="A brief one-line course description"
                      className="w-full px-4 py-3 border border-dark-200 rounded-xl text-dark-900 focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark-700 mb-1.5">
                      Full Description
                    </label>
                    <textarea
                      value={newCourse.description}
                      onChange={(e) =>
                        setNewCourse((p) => ({ ...p, description: e.target.value }))
                      }
                      rows={4}
                      placeholder="A detailed description of the course…"
                      className="w-full px-4 py-3 border border-dark-200 rounded-xl text-dark-900 focus:outline-none focus:border-primary-400 transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-dark-700 mb-1.5">
                        Price (USD) *
                      </label>
                      <div className="flex items-center border border-dark-200 rounded-xl overflow-hidden focus-within:border-primary-400 transition-colors">
                        <span className="px-3 py-3 text-dark-400 bg-dark-50 border-r border-dark-200">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newCourse.price}
                          onChange={(e) =>
                            setNewCourse((p) => ({ ...p, price: e.target.value }))
                          }
                          placeholder="197.00"
                          className="flex-1 px-4 py-3 text-dark-900 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark-700 mb-1.5">
                        Estimated Hours
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={newCourse.estimatedHours}
                        onChange={(e) =>
                          setNewCourse((p) => ({ ...p, estimatedHours: e.target.value }))
                        }
                        placeholder="12"
                        className="w-full px-4 py-3 border border-dark-200 rounded-xl text-dark-900 focus:outline-none focus:border-primary-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={actionLoading === 'create'}
                      className="w-full py-3.5 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-400 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'create' ? 'Creating…' : 'Create Course (Draft)'}
                    </button>
                    <p className="text-center text-dark-400 text-xs mt-3">
                      The course will be created as a draft. Publish it from the Courses tab when ready.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
