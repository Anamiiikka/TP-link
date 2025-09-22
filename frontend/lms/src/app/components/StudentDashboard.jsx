import React from 'react';

const CourseCard = ({course}) => (
  <div className="bg-gradient-to-br from-white to-blue-50/50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100/50 transform hover:scale-105 hover:-translate-y-2 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors duration-300">{course.title}</h4>
        <span className="text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">{course.progress}%</span>
      </div>
      <p className="text-sm text-gray-600 mb-4 font-medium flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        {course.instructor}
      </p>
      <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner mb-3">
        <div 
          className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden" 
          style={{width: `${course.progress}%`}}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
        </div>
      </div>
      <div className="text-xs text-gray-500 font-medium">
        {course.status === 'completed' ? '✅ Completed' : '📚 In Progress'}
      </div>
    </div>
  </div>
);

const AssignmentRow = ({assignment}) => (
  <div className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl px-4 transition-all duration-300 group">
    <div className="flex items-center space-x-3">
      <div className={`w-3 h-3 rounded-full ${
        assignment.status === 'pending' ? 'bg-red-400 animate-pulse' : 
        assignment.status === 'submitted' ? 'bg-yellow-400' : 'bg-green-400'
      } group-hover:scale-150 transition-transform duration-300`}></div>
      <div>
        <div className="font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">{assignment.title}</div>
        <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{assignment.course}</div>
      </div>
    </div>
    <div className="text-right">
      <div className={`text-sm font-bold px-3 py-1 rounded-full ${
        assignment.status === 'pending' ? 'text-red-600 bg-red-100' : 
        assignment.status === 'submitted' ? 'text-blue-600 bg-blue-100' : 'text-green-600 bg-green-100'
      } transition-colors duration-300`}>
        {assignment.status.toUpperCase()}
      </div>
      <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-300">{assignment.due}</div>
    </div>
  </div>
);

const ProgressBar = ({label, value, color, showPercentage = true}) => (
  <div className="mb-6">
    <div className="flex justify-between items-center text-sm mb-2">
      <span className="text-gray-700 font-semibold">{label}</span>
      {showPercentage && <span className="text-gray-800 font-bold">{value}%</span>}
    </div>
    <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner">
      <div 
        className={`h-3 rounded-full ${color} transition-all duration-1000 ease-out shadow-lg relative overflow-hidden`} 
        style={{width: `${value}%`}}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
      </div>
    </div>
  </div>
);

const GradeCard = ({grade}) => (
  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-white to-gray-50 rounded-2xl border hover:shadow-lg transition-all duration-300 group hover:border-blue-200">
    <div className="flex-1">
      <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{grade.course}</div>
      <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{grade.assignment} • {grade.percentage}%</div>
    </div>
    <div className={`text-xl font-black px-4 py-2 rounded-full shadow-lg ${
      grade.grade.startsWith('A') ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
      grade.grade.startsWith('B') ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white' :
      grade.grade.startsWith('C') ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
      'bg-gradient-to-r from-red-400 to-red-500 text-white'
    } group-hover:scale-110 transition-transform duration-300`}>{grade.grade}</div>
  </div>
);

export default function StudentDashboard({data, session, onLogout}){
  const userName = session?.user?.name || session?.user?.preferred_username || session?.user?.email || 'Student';
  const studentId = session?.user?.sub || session?.user?.admission_number || 'N/A';
  
  const defaults = {
    enrolledCourses: [
      {id:1, title:'JavaScript Fundamentals', instructor:'Dr. Smith', progress: 75, status:'active'},
      {id:2, title:'React Development', instructor:'Prof. Johnson', progress: 45, status:'active'},
      {id:3, title:'Database Design', instructor:'Dr. Wilson', progress: 100, status:'completed'},
    ],
    assignments: [
      {id:1, title:'JavaScript Final Project', course:'JS Fundamentals', status:'pending', due:'Oct 15'},
      {id:2, title:'Component Design', course:'React Development', status:'submitted', due:'Oct 10'},
      {id:3, title:'Database Schema', course:'Database Design', status:'graded', due:'Sep 30'},
    ],
    grades: [
      {course: 'JavaScript Fundamentals', assignment: 'Midterm Exam', grade: 'A-', percentage: 92},
      {course: 'React Development', assignment: 'Component Project', grade: 'B+', percentage: 87},
      {course: 'Database Design', assignment: 'Final Project', grade: 'A', percentage: 95},
    ],
    overallGPA: 3.7,
    completedHours: 24,
    totalHours: 36,
    currentStreak: 5,
  };

  const sample = {
    ...defaults,
    ...(data || {}),
    enrolledCourses: Array.isArray(data?.enrolledCourses) ? data.enrolledCourses : defaults.enrolledCourses,
    assignments: Array.isArray(data?.assignments) ? data.assignments : defaults.assignments,
    grades: Array.isArray(data?.grades) ? data.grades : defaults.grades,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-100 p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-2xl mb-6 transform hover:rotate-12 transition-transform duration-500">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-xl text-gray-600 mb-6 font-medium">Your personalized learning journey awaits</p>
          <div className="flex justify-center items-center gap-6 text-sm">
            <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 font-medium">Student ID: {studentId}</span>
            </div>
            <button 
              onClick={onLogout}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🚪 Logout
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/50">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">📚</span>
                My Courses
                <span className="ml-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">{(sample.enrolledCourses || []).length} enrolled</span>
              </h3>
              {(sample.enrolledCourses || []).length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📖</div>
                  <div className="text-gray-500 font-medium">No courses enrolled yet</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {(sample.enrolledCourses || []).map(course => <CourseCard key={course.id} course={course} />)}
                </div>
              )}
              <div className="flex flex-wrap gap-4 mt-6">
                <button className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl flex items-center space-x-2">
                  <span className="text-xl">📖</span>
                  <span>Browse Courses</span>
                </button>
                <button className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl flex items-center space-x-2">
                  <span className="text-xl">📊</span>
                  <span>View Progress</span>
                </button>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/50">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">📝</span>
                Assignments
                <span className="ml-3 bg-gradient-to-r from-red-400 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse shadow-lg">
                  {(sample.assignments || []).filter(a => a.status === 'pending').length} pending
                </span>
              </h3>
              {(sample.assignments || []).length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <div className="text-gray-500 font-medium">All caught up!</div>
                </div>
              ) : (
                <div>
                  {(sample.assignments || []).map(assignment => <AssignmentRow key={assignment.id} assignment={assignment} />)}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/50">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">🎯</span>
                Academic Progress
              </h3>
              <div className="text-center mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">{sample.overallGPA}</div>
                <div className="text-gray-600 font-semibold">Overall GPA</div>
              </div>
              <ProgressBar label="Degree Progress" value={(sample.completedHours / sample.totalHours) * 100} color="bg-gradient-to-r from-blue-400 to-purple-500" />
              <div className="text-center text-sm text-gray-600 font-medium bg-gray-50 rounded-xl py-3">
                <span className="font-bold text-blue-600">{sample.completedHours}</span> of <span className="font-bold text-purple-600">{sample.totalHours}</span> credit hours completed
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/50">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">📊</span>
                Recent Grades
              </h3>
              <div className="space-y-4">
                {(sample.grades || []).map((grade, index) => <GradeCard key={index} grade={grade} />)}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/50">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">🏆</span>
                Achievements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                  <span className="text-2xl">🥇</span>
                  <span className="text-sm text-gray-700 font-medium">Dean's List - Spring 2024</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <span className="text-2xl">⭐</span>
                  <span className="text-sm text-gray-700 font-medium">Perfect Attendance</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <span className="text-2xl">📚</span>
                  <span className="text-sm text-gray-700 font-medium">Course Completion Streak: {sample.currentStreak}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/50">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">💡</span>
                Study Tips
              </h3>
              <ol className="list-none space-y-3 text-gray-700 text-sm">
                <li className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-blue-500 font-bold">1.</span>
                  <span className="font-medium">Review course materials regularly</span>
                </li>
                <li className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-green-500 font-bold">2.</span>
                  <span className="font-medium">Participate actively in discussions</span>
                </li>
                <li className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-yellow-500 font-bold">3.</span>
                  <span className="font-medium">Submit assignments before deadlines</span>
                </li>
                <li className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-purple-500 font-bold">4.</span>
                  <span className="font-medium">Utilize office hours for extra help</span>
                </li>
                <li className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-pink-500 font-bold">5.</span>
                  <span className="font-medium">Form study groups with classmates</span>
                </li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
