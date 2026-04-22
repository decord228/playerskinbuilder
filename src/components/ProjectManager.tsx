import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { exportProjectAsZip } from '../utils/projectExport';
import './ProjectManager.css';

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

function ProjectManager({ isOpen, onClose }: ProjectManagerProps) {
  const {
    projects,
    currentProjectId,
    isLoading,
    initStorage,
    loadProjects,
    createProject,
    openProject,
    deleteProject
  } = useProjectStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (isOpen && !isInitialized) {
      initStorage().then(() => {
        setIsInitialized(true);
        loadProjects();
      }).catch((error) => {
        console.error('Failed to initialize storage:', error);
        alert('Failed to access file system. Please grant permission.');
      });
    }
  }, [isOpen, isInitialized, initStorage, loadProjects]);

  if (!isOpen) return null;

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const projectId = await createProject(newProjectName);
      setNewProjectName('');
      setShowCreateDialog(false);
      await openProject(projectId);
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  const handleOpenProject = async (id: string) => {
    try {
      await openProject(id);
      onClose();
    } catch (error) {
      console.error('Failed to open project:', error);
      alert('Failed to open project');
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!window.confirm(`Delete project "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteProject(id);
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const handleExportProject = async (id: string, name: string) => {
    setIsExporting(true);
    try {
      await exportProjectAsZip(id, name);
    } catch (error) {
      console.error('Failed to export project:', error);
      alert('Failed to export project');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportProject = async () => {
    setIsImporting(true);
    try {
      // Ask user to select project folder
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });

      // Check if project.json exists
      try {
        const fileHandle = await dirHandle.getFileHandle('project.json');
        const file = await fileHandle.getFile();
        const projectData = JSON.parse(await file.text());

        // Import the project
        const projectId = dirHandle.name;
        await openProject(projectId);
        await loadProjects();
        onClose();
      } catch (error) {
        alert('Invalid project folder. Missing project.json file.');
      }
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        console.error('Failed to import project:', error);
        alert('Failed to import project');
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pm-header">
          <h1>Projects</h1>
          <button className="pm-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="pm-body">
          {!isInitialized ? (
            <div className="pm-init">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <h2>Grant Folder Access</h2>
              <p>SkinBuilder needs access to save your projects.</p>
              <p className="pm-hint">Select your Documents folder when prompted.</p>
            </div>
          ) : isLoading ? (
            <div className="pm-init">
              <div className="pm-spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : (
            <>
              <div className="pm-toolbar">
                <button className="pm-btn pm-btn-primary" onClick={() => setShowCreateDialog(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  New Project
                </button>
                <button
                  className="pm-btn pm-btn-secondary"
                  onClick={handleImportProject}
                  disabled={isImporting}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  {isImporting ? 'Importing...' : 'Import Project'}
                </button>
              </div>

              {showCreateDialog && (
                <div className="pm-create">
                  <input
                    type="text"
                    placeholder="Enter project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                    autoFocus
                  />
                  <div className="pm-create-actions">
                    <button className="pm-btn pm-btn-secondary" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </button>
                    <button
                      className="pm-btn pm-btn-primary"
                      onClick={handleCreateProject}
                      disabled={!newProjectName.trim()}
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}

              {projects.length === 0 ? (
                <div className="pm-empty">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <h2>No projects yet</h2>
                  <p>Create your first project to get started</p>
                </div>
              ) : (
                <div className="pm-grid">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`pm-project ${currentProjectId === project.id ? 'active' : ''}`}
                      onClick={() => handleOpenProject(project.id)}
                    >
                      <div className="pm-project-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <div className="pm-project-info">
                        <h3>{project.name}</h3>
                        <span>{new Date(project.modified).toLocaleDateString()}</span>
                      </div>
                      <div className="pm-project-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportProject(project.id, project.name);
                          }}
                          disabled={isExporting}
                          title="Export"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id, project.name);
                          }}
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectManager;
