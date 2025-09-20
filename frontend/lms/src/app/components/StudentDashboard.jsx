import React from 'react';

const CourseCard = ({course}) => (
  <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold text-gray-800">{course.title}</h4>
      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{course.progress}%</span>
    </div>
    <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{width: `${course.progress}%`}}></div>
    </div>
  </div>
);

const AssignmentRow = ({assignment}) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200">
    <div>
      <div className="font-semibold text-gray-800">{assignment.title}</div>
      <div className="text-sm text-gray-600">{assignment.course}</div>
    </div>
    <div className="text-right">
      <div className={`text-sm font-medium ${assignment.status === 'pending' ? 'text-red-600' : assignment.status === 'submitted' ? 'text-blue-600' : 'text-green-600'}`}>
        {assignment.status.toUpperCase()}
      </div>
      <div className="text-xs text-gray-500">{assignment.due}</div>
    </div>
  </div>
);

const ProgressBar = ({label, value, max, color}) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-800 font-medium">{value}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{width: `${value}%`}}></div>
    </div>
  </div>
);

export default function StudentDashboard({data, session, onLogout}){
  const defaults = {
    name: session?.user?.name || 'Student',
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

  // Merge provided data with defaults to ensure arrays exist
  const sample = {
    ...defaults,
    ...(data || {}),
    enrolledCourses: Array.isArray(data?.enrolledCourses) ? data.enrolledCourses : defaults.enrolledCourses,
    assignments: Array.isArray(data?.assignments) ? data.assignments : defaults.assignments,
    grades: Array.isArray(data?.grades) ? data.grades : defaults.grades,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 animate-fade-in">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Welcome, {sample.name} 👋
        </h1>
        <p className="text-gray-600 text-lg">Your learning journey and academic progress overview.</p>
        <div className="mt-4 flex justify-center gap-4">
          <span className="text-sm text-gray-600">Student ID: {session?.user?.sub}</span>
          <button 
            onClick={onLogout}
            className="text-sm text-green-600 hover:text-green-800 underline"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              📚 My Courses
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">{(sample.enrolledCourses || []).length} enrolled</span>
            </h3>
            {(sample.enrolledCourses || []).length === 0 ? (
              <div className="text-gray-500 py-4 text-center">You are not enrolled in any courses yet.</div>
            ) : (
              <div className="space-y-4">
                {(sample.enrolledCourses || []).map(course => <CourseCard key={course.id} course={course} />)}
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md">
                📖 Browse Courses
              </button>
              <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md">
                📊 View Progress
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              📝 Assignments
              <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                {(sample.assignments || []).filter(a => a.status === 'pending').length} pending
              </span>
            </h3>
            {(sample.assignments || []).length === 0 ? (
              <div className="text-gray-500 py-4 text-center">No assignments at the moment.</div>
            ) : (
              <div>
                {(sample.assignments || []).map(assignment => <AssignmentRow key={assignment.id} assignment={assignment} />)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              🎯 Academic Progress
              <span className="ml-2 text-2xl">📈</span>
            </h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600">{sample.overallGPA}</div>
              <div className="text-gray-600">Overall GPA</div>
            </div>
            <ProgressBar label="Degree Progress" value={(sample.completedHours / sample.totalHours) * 100} max={100} color="bg-blue-500" />
            <div className="text-center text-sm text-gray-600">
              {sample.completedHours} of {sample.totalHours} credit hours completed
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">📊 Recent Grades</h3>
            <div className="space-y-3">
              {(sample.grades || []).map((grade, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div>
                    <div className="font-medium text-gray-800">{grade.course}</div>
                    <div className="text-sm text-gray-600">{grade.assignment} - {grade.percentage}%</div>
                  </div>
                  <div className={`text-lg font-bold px-3 py-1 rounded-full ${
                    grade.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                    grade.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                    grade.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{grade.grade}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">🏆 Achievements</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🥇</span>
                <span className="text-sm text-gray-700">Dean's List - Spring 2024</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">⭐</span>
                <span className="text-sm text-gray-700">Perfect Attendance</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">📚</span>
                <span className="text-sm text-gray-700">Course Completion Streak: 5</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">💡 Study Tips</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
              <li>Review course materials regularly.</li>
              <li>Participate actively in discussions.</li>
              <li>Submit assignments before deadlines.</li>
              <li>Utilize office hours for extra help.</li>
              <li>Form study groups with classmates.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}