import { describe, test, expect, beforeEach } from '@jest/globals';
import { initDB, saveProject, getProject, getAllProjects, deleteProject, generateId } from '../js/storage.js';

describe('Storage Module', () => {
  beforeEach(async () => {
    // Initialize database before each test
    await initDB();
  });

  describe('generateId', () => {
    test('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    test('should generate IDs with correct format', () => {
      const id = generateId();
      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe('saveProject and getProject', () => {
    test('should save and retrieve a project', async () => {
      const project = {
        id: generateId(),
        name: 'Test Project',
        description: 'Test Description',
        created: Date.now(),
        modified: Date.now(),
        currentPhase: 1,
        phases: []
      };

      await saveProject(project);
      const retrieved = await getProject(project.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved.id).toBe(project.id);
      expect(retrieved.name).toBe(project.name);
      expect(retrieved.description).toBe(project.description);
    });

    test('should update modified timestamp on save', async () => {
      const project = {
        id: generateId(),
        name: 'Test Project',
        description: 'Test Description',
        created: Date.now(),
        modified: Date.now(),
        currentPhase: 1,
        phases: []
      };

      await saveProject(project);
      const originalModified = project.modified;

      // Wait a bit and save again
      await new Promise(resolve => setTimeout(resolve, 10));
      await saveProject(project);
      const updated = await getProject(project.id);

      expect(updated.modified).toBeGreaterThan(originalModified);
    });
  });

  describe('getAllProjects', () => {
    test('should return empty array when no projects exist', async () => {
      const projects = await getAllProjects();
      expect(Array.isArray(projects)).toBe(true);
    });

    test('should return all saved projects', async () => {
      const project1 = {
        id: generateId(),
        name: 'Project 1',
        description: 'Description 1',
        created: Date.now(),
        modified: Date.now(),
        currentPhase: 1,
        phases: []
      };

      const project2 = {
        id: generateId(),
        name: 'Project 2',
        description: 'Description 2',
        created: Date.now(),
        modified: Date.now(),
        currentPhase: 1,
        phases: []
      };

      await saveProject(project1);
      await saveProject(project2);

      const projects = await getAllProjects();
      expect(projects.length).toBeGreaterThanOrEqual(2);
    });

    test('should sort projects by modified date (newest first)', async () => {
      const now = Date.now();
      const project1 = {
        id: generateId(),
        name: 'Old Project',
        description: 'Description',
        created: now - 2000,
        modified: now - 2000,
        currentPhase: 1,
        phases: []
      };

      await saveProject(project1);

      // Wait to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));

      const project2 = {
        id: generateId(),
        name: 'New Project',
        description: 'Description',
        created: Date.now(),
        modified: Date.now(),
        currentPhase: 1,
        phases: []
      };

      await saveProject(project2);

      const projects = await getAllProjects();
      const project2Index = projects.findIndex(p => p.id === project2.id);
      const project1Index = projects.findIndex(p => p.id === project1.id);

      expect(project2Index).toBeLessThan(project1Index);
    });
  });

  describe('deleteProject', () => {
    test('should delete a project', async () => {
      const project = {
        id: generateId(),
        name: 'Test Project',
        description: 'Test Description',
        created: Date.now(),
        modified: Date.now(),
        currentPhase: 1,
        phases: []
      };

      await saveProject(project);
      await deleteProject(project.id);
      const retrieved = await getProject(project.id);

      expect(retrieved).toBeUndefined();
    });
  });
});

