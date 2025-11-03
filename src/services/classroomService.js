import api from './api.js';

const classroomService = {
  // Get all classrooms for current user
  async getAllClassrooms() {
    try {
      const { data } = await api.get('/classrooms');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch classrooms');
    }
  },

  // Get single classroom by ID
  async getClassroomById(classroomId) {
    try {
      const { data } = await api.get(`/classrooms/${classroomId}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch classroom');
    }
  },

  // Create a new classroom (teacher only)
  async createClassroom(name) {
    try {
      const { data } = await api.post('/classrooms', { name });
      return data; // includes generated joinCode
    } catch (error) {
      throw new Error(error.message || 'Failed to create classroom');
    }
  },

  // Join classroom with code (student only)
  async joinClassroom(joinCode) {
    try {
      const { data } = await api.post('/classrooms/join', { joinCode });
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to join classroom');
    }
  },

  // Update classroom name (teacher only)
  async updateClassroom(classroomId, name) {
    try {
      const { data } = await api.patch(`/classrooms/${classroomId}`, { name });
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update classroom');
    }
  },

  // Delete classroom (teacher only)
  async deleteClassroom(classroomId) {
    try {
      const { data } = await api.delete(`/classrooms/${classroomId}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete classroom');
    }
  },

  // Get all students in a classroom (teacher only)
  async getStudentsFromClassroom(classroomId) {
    try {
      const { data } = await api.get(`/classrooms/${classroomId}/students`);
      return data.students;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch students');
    }
  },

  // Remove student from classroom (teacher only)
  async removeStudent(classroomId, studentId) {
    try {
      const { data } = await api.delete(`/classrooms/${classroomId}/students/${studentId}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to remove student');
    }
  },

  // Leave classroom (student only)
  async leaveClassroom(classroomId) {
    try {
      const { data } = await api.post(`/classrooms/${classroomId}/leave`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to leave classroom');
    }
  },

};

export default classroomService;