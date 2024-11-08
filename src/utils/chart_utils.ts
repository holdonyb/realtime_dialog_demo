import { studentRecords, courses } from './dummy_data';

export const generateGradeDistribution = () => {
  const gradeRanges = ['90-100', '80-89', '70-79', '60-69', 'Below 60'];
  const distribution = new Array(5).fill(0);

  studentRecords.forEach(student => {
    if (student.grade >= 90) distribution[0]++;
    else if (student.grade >= 80) distribution[1]++;
    else if (student.grade >= 70) distribution[2]++;
    else if (student.grade >= 60) distribution[3]++;
    else distribution[4]++;
  });

  return {
    type: 'bar',
    data: {
      labels: gradeRanges,
      datasets: [{
        label: 'Number of Students',
        data: distribution,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Grade Distribution'
        }
      }
    }
  };
};

export const generateCourseAverages = () => {
  const averages = courses.map(course => {
    const courseStudents = studentRecords.filter(student => student.course === course);
    const average = courseStudents.reduce((acc, student) => acc + student.grade, 0) / courseStudents.length;
    return Math.round(average);
  });

  return {
    type: 'bar',
    data: {
      labels: courses,
      datasets: [{
        label: 'Average Grade',
        data: averages,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Course Averages'
        }
      }
    }
  };
}; 