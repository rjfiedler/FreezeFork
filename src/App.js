import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Download, GitBranch, Clock, File, Folder, Share2, Eye } from 'lucide-react';
import * as THREE from 'three';

// Mock data for demonstration
const mockProject = {
  id: "proj-1",
  name: "Robotic Arm Assembly",
  description: "6-DOF robotic arm for manufacturing automation",
  branches: [
    { id: "main", name: "main", commitCount: 12, color: "#3b82f6" },
    { id: "lightweight", name: "lightweight", commitCount: 8, color: "#10b981" },
    { id: "extended", name: "extended", commitCount: 5, color: "#f59e0b" }
  ],
  currentBranch: "main"
};

// Branch tree structure showing how commits relate - positioned like a Git network graph
const branchTree = [
  {
    id: "commit-1",
    message: "Initial robotic arm concept",
    timestamp: "2025-08-01T09:00:00Z",
    author: "John Smith",
    branch: "main",
    x: 50,
    y: 50,
    parents: []
  },
  {
    id: "commit-2", 
    message: "Added base plate design",
    timestamp: "2025-08-02T11:30:00Z",
    author: "Sarah Johnson", 
    branch: "main",
    x: 150,
    y: 50,
    parents: ["commit-1"]
  },
  {
    id: "commit-3",
    message: "Integrated motor mount system",
    timestamp: "2025-08-03T14:15:00Z",
    author: "Mike Chen",
    branch: "main", 
    x: 250,
    y: 50,
    parents: ["commit-2"]
  },
  {
    id: "commit-4",
    message: "Added arm segments with joints",
    timestamp: "2025-08-04T16:45:00Z",
    author: "John Smith",
    branch: "main",
    x: 350,
    y: 50,
    parents: ["commit-3"]
  },
  {
    id: "commit-5",
    message: "Lightweight materials exploration",
    timestamp: "2025-08-05T10:20:00Z", 
    author: "Sarah Johnson",
    branch: "lightweight",
    x: 450,
    y: 120,
    parents: ["commit-4"]
  },
  {
    id: "commit-6",
    message: "Extended reach prototype", 
    timestamp: "2025-08-05T15:30:00Z",
    author: "Mike Chen",
    branch: "extended",
    x: 450,
    y: 180,
    parents: ["commit-4"]
  },
  {
    id: "commit-7",
    message: "Optimized joint bearings",
    timestamp: "2025-08-09T10:15:00Z",
    author: "Sarah Johnson",
    branch: "main",
    x: 450,
    y: 50,
    parents: ["commit-4"]
  },
  {
    id: "commit-8",
    message: "Added gripper mechanism",
    timestamp: "2025-08-10T14:30:00Z",
    author: "John Smith", 
    branch: "main",
    x: 550,
    y: 50,
    parents: ["commit-7"]
  },
  {
    id: "commit-9",
    message: "Carbon fiber arm segments",
    timestamp: "2025-08-11T09:00:00Z",
    author: "Sarah Johnson", 
    branch: "lightweight",
    x: 550,
    y: 120,
    parents: ["commit-5"]
  },
  {
    id: "commit-10",
    message: "Extended base for stability",
    timestamp: "2025-08-11T14:00:00Z",
    author: "Mike Chen", 
    branch: "extended",
    x: 550,
    y: 180,
    parents: ["commit-6"]
  }
];

const mockDesignTree = {
  "commit-8": {
    name: "RoboticArm_Assembly.SLDASM",
    type: "assembly",
    children: [
      {
        name: "Base_Assembly.SLDASM",
        type: "assembly",
        children: [
          { name: "Base_Plate.SLDPRT", type: "part", size: "2.4 MB" },
          { name: "Motor_Mount.SLDPRT", type: "part", size: "1.8 MB" },
          { name: "Base_Motor.SLDPRT", type: "part", size: "3.2 MB" }
        ]
      },
      {
        name: "Arm_Segments.SLDASM",
        type: "assembly", 
        children: [
          { name: "Lower_Arm.SLDPRT", type: "part", size: "4.1 MB" },
          { name: "Upper_Arm.SLDPRT", type: "part", size: "3.8 MB" },
          { name: "Joint_Bearing.SLDPRT", type: "part", size: "0.9 MB" }
        ]
      },
      {
        name: "Gripper_Assembly.SLDASM",
        type: "assembly",
        children: [
          { name: "Gripper_Base.SLDPRT", type: "part", size: "1.5 MB" },
          { name: "Gripper_Jaw_Left.SLDPRT", type: "part", size: "1.2 MB" },
          { name: "Gripper_Jaw_Right.SLDPRT", type: "part", size: "1.2 MB" },
          { name: "Pneumatic_Cylinder.SLDPRT", type: "part", size: "2.1 MB" }
        ]
      }
    ]
  },
  "commit-7": {
    name: "RoboticArm_Assembly.SLDASM",
    type: "assembly",
    children: [
      {
        name: "Base_Assembly.SLDASM", 
        type: "assembly",
        children: [
          { name: "Base_Plate.SLDPRT", type: "part", size: "2.4 MB" },
          { name: "Motor_Mount.SLDPRT", type: "part", size: "1.8 MB" },
          { name: "Base_Motor.SLDPRT", type: "part", size: "3.2 MB" }
        ]
      },
      {
        name: "Arm_Segments.SLDASM",
        type: "assembly",
        children: [
          { name: "Lower_Arm.SLDPRT", type: "part", size: "4.1 MB" },
          { name: "Upper_Arm.SLDPRT", type: "part", size: "3.8 MB" },
          { name: "Joint_Bearing_Optimized.SLDPRT", type: "part", size: "0.9 MB" }
        ]
      }
    ]
  }
};

const TreeNode = ({ node, onDownload, onFork, expanded, onToggle, path = "" }) => {
  const hasChildren = node.children && node.children.length > 0;
  const currentPath = path ? `${path}/${node.name}` : node.name;
  
  return (
    <div className="select-none">
      <div 
        className="flex items-center py-1 px-2 hover:bg-blue-50 rounded cursor-pointer group"
        onClick={() => hasChildren && onToggle(currentPath)}
      >
        <div className="flex items-center flex-1 min-w-0">
          {hasChildren ? (
            expanded ? <ChevronDown className="w-4 h-4 mr-1 text-gray-500" /> : <ChevronRight className="w-4 h-4 mr-1 text-gray-500" />
          ) : (
            <div className="w-5"></div>
          )}
          
          {node.type === 'assembly' ? (
            <Folder className="w-4 h-4 mr-2 text-blue-600" />
          ) : (
            <File className="w-4 h-4 mr-2 text-green-600" />
          )}
          
          <span className="truncate text-sm font-medium text-gray-800">{node.name}</span>
          {node.size && <span className="ml-2 text-xs text-gray-500">({node.size})</span>}
        </div>
        
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onDownload(node, currentPath); }}
            className="p-1 hover:bg-blue-100 rounded mr-1"
            title="Download file"
          >
            <Download className="w-3 h-3 text-blue-600" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onFork(currentPath); }}
            className="p-1 hover:bg-green-100 rounded"
            title="Fork from here"
          >
            <GitBranch className="w-3 h-3 text-green-600" />
          </button>
        </div>
      </div>
      
      {hasChildren && expanded && (
        <div className="ml-4 border-l border-gray-200">
          {node.children.map((child, index) => (
            <TreeNode 
              key={`${child.name}-${index}`}
              node={child} 
              onDownload={onDownload}
              onFork={onFork}
              expanded={expanded}
              onToggle={onToggle}
              path={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ThreeDPreview = ({ commitId }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Clean up previous scene
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (rendererRef.current && mountRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
      mountRef.current.removeChild(rendererRef.current.domElement);
    }
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(200, 200);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Create simple robotic arm representation based on commit
    const createRoboticArm = () => {
      const group = new THREE.Group();
      
      // Base
      const baseGeometry = new THREE.CylinderGeometry(1, 1.2, 0.5, 8);
      const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x4a5568 });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = 0.25;
      base.castShadow = true;
      group.add(base);
      
      // Lower arm
      const lowerArmGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 8);
      const armMaterial = new THREE.MeshLambertMaterial({ color: 0x3182ce });
      const lowerArm = new THREE.Mesh(lowerArmGeometry, armMaterial);
      lowerArm.position.set(0, 2, 0);
      lowerArm.castShadow = true;
      group.add(lowerArm);
      
      // Upper arm
      const upperArmGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 8);
      const upperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
      upperArm.position.set(0, 4.75, 0);
      upperArm.castShadow = true;
      group.add(upperArm);
      
      // Add gripper if this is the latest commit
      if (commitId === "commit-8") {
        const gripperGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.1);
        const gripperMaterial = new THREE.MeshLambertMaterial({ color: 0x10b981 });
        
        const gripperLeft = new THREE.Mesh(gripperGeometry, gripperMaterial);
        gripperLeft.position.set(-0.2, 6.2, 0);
        gripperLeft.castShadow = true;
        group.add(gripperLeft);
        
        const gripperRight = new THREE.Mesh(gripperGeometry, gripperMaterial);
        gripperRight.position.set(0.2, 6.2, 0);
        gripperRight.castShadow = true;
        group.add(gripperRight);
      }
      
      return group;
    };
    
    const roboticArm = createRoboticArm();
    scene.add(roboticArm);
    
    // Add ground plane
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);
    
    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      roboticArm.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
      animate();
    }
    
    sceneRef.current = scene;
    rendererRef.current = renderer;
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current && mountRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
        try {
          mountRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {
          // Ignore if already removed
        }
      }
    };
  }, [commitId]);
  
  return <div ref={mountRef} className="w-[200px] h-[200px] rounded border bg-gray-50" />;
};

const GitNetworkGraph = ({ commits, selectedCommit, onSelectCommit, branches }) => {
  const svgRef = useRef(null);
  
  // Create branch color map
  const branchColors = branches.reduce((acc, branch) => {
    acc[branch.name] = branch.color;
    return acc;
  }, {});
  
  // Calculate SVG dimensions
  const maxX = Math.max(...commits.map(c => c.x)) + 100;
  const maxY = Math.max(...commits.map(c => c.y)) + 100;
  
  // Helper function to draw curved connections
  const createPath = (from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const curve = Math.abs(dy) * 0.5;
    
    return `M ${from.x} ${from.y} C ${from.x + curve} ${from.y}, ${to.x - curve} ${to.y}, ${to.x} ${to.y}`;
  };
  
  return (
    <div className="w-full overflow-x-auto">
      <svg 
        ref={svgRef}
        width={maxX}
        height={maxY}
        className="border rounded-lg bg-white"
      >
        {/* Draw connection lines */}
        {commits.map(commit => {
          return commit.parents.map(parentId => {
            const parent = commits.find(c => c.id === parentId);
            if (!parent) return null;
            
            // Use the commit's branch color for all connections
            const lineColor = branchColors[commit.branch];
            
            return (
              <path
                key={`${parentId}-${commit.id}`}
                d={createPath(parent, commit)}
                stroke={lineColor}
                strokeWidth="4"
                fill="none"
                opacity="0.9"
              />
            );
          });
        })}
        
        {/* Draw commit nodes */}
        {commits.map(commit => {
          const isSelected = selectedCommit === commit.id;
          const branchColor = branchColors[commit.branch] || '#6b7280';
          
          return (
            <g key={commit.id}>
              {/* Commit circle */}
              <circle
                cx={commit.x}
                cy={commit.y}
                r={isSelected ? 14 : 10}
                fill={branchColor}
                stroke={isSelected ? "#ef4444" : "#ffffff"}
                strokeWidth={isSelected ? "4" : "3"}
                className="cursor-pointer transition-all duration-200 hover:stroke-gray-600"
                onClick={() => onSelectCommit(commit.id)}
                style={{
                  filter: isSelected ? 'drop-shadow(0 4px 8px rgba(239,68,68,0.3))' : 'none'
                }}
              />
              
              {/* Show commit message only for selected node */}
              {isSelected && (
                <text
                  x={commit.x}
                  y={commit.y - 25}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-800 pointer-events-none"
                  style={{ maxWidth: '150px' }}
                >
                  {commit.message.length > 20 ? commit.message.substring(0, 20) + '...' : commit.message}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const CommitDetailPanel = ({ commit, onDownload, onFork }) => {
  if (!commit) {
    return (
      <div className="bg-gray-50 border rounded-lg p-8 text-center text-gray-500">
        <GitBranch className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Click on any commit node to view details</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{commit.message}</h3>
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono mr-3">
              {commit.branch}
            </span>
            <Clock className="w-4 h-4 mr-1" />
            <span>{new Date(commit.timestamp).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>{commit.author}</span>
          </div>
        </div>
        <div className="text-sm text-gray-400 font-mono">
          {commit.id.slice(-8)}
        </div>
      </div>
      
      {/* 3D Preview */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">3D Assembly Preview</h4>
        <div className="flex justify-center bg-gray-50 rounded-lg p-4">
          <ThreeDPreview commitId={commit.id} />
        </div>
      </div>
      
      {/* Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => onDownload('complete-assembly', commit.id)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Assembly
          </button>
          <button 
            onClick={() => onFork(commit.id)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Fork from Here
          </button>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
            <Eye className="w-4 h-4 mr-2" />
            Open in SolidWorks
          </button>
        </div>
        
        <div className="pt-2 border-t">
          <button 
            onClick={() => onDownload('individual-files', commit.id)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Download individual files
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SolidWorksPDM() {
  const [selectedCommit, setSelectedCommit] = useState("commit-8");
  const [expandedNodes, setExpandedNodes] = useState({"RoboticArm_Assembly.SLDASM": true});
  const [activeTab, setActiveTab] = useState('history');

  const currentTree = mockDesignTree[selectedCommit];
  
  const toggleNode = (path) => {
    setExpandedNodes(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  const handleDownload = (node, path) => {
    alert(`Downloading: ${node.name}\nPath: ${path}\nSize: ${node.size || 'N/A'}`);
  };
  
  const handleFork = (path) => {
    const branchName = prompt(`Create new branch from commit ${selectedCommit.slice(-8)}:\n\nForking from: ${path}`, "my-feature-branch");
    if (branchName) {
      alert(`Created new branch: "${branchName}"\nForked from: ${path}\nCommit: ${selectedCommit}`);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/project/${mockProject.id}/commit/${selectedCommit}`;
    navigator.clipboard.writeText(url);
    alert(`Share link copied to clipboard:\n${url}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{mockProject.name}</h1>
              <p className="text-sm text-gray-600">{mockProject.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                {mockProject.branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.commitCount} commits)
                  </option>
                ))}
              </select>
              <button 
                onClick={handleShare}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border">
          {/* Tab Navigation */}
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              <button 
                onClick={() => setActiveTab('history')}
                className={`py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'history' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <GitBranch className="w-4 h-4 mr-2 inline" />
                Branch History
              </button>
              <button 
                onClick={() => setActiveTab('tree')}
                className={`py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'tree' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Folder className="w-4 h-4 mr-2 inline" />
                Design Tree
              </button>
              <button 
                onClick={() => setActiveTab('files')}
                className={`py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'files' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <File className="w-4 h-4 mr-2 inline" />
                All Files
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Network Graph</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Click any commit node to view the 3D assembly and download options. Lines show the branching structure.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Network Graph - takes up 2/3 on large screens */}
                  <div className="lg:col-span-2">
                    <GitNetworkGraph 
                      commits={branchTree}
                      selectedCommit={selectedCommit}
                      onSelectCommit={setSelectedCommit}
                      branches={mockProject.branches}
                    />
                  </div>
                  
                  {/* Detail Panel - takes up 1/3 on large screens */}
                  <div className="lg:col-span-1">
                    <CommitDetailPanel 
                      commit={branchTree.find(c => c.id === selectedCommit)}
                      onDownload={handleDownload}
                      onFork={handleFork}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'tree' && currentTree && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {branchTree.find(c => c.id === selectedCommit)?.message || "Design Tree"}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(branchTree.find(c => c.id === selectedCommit)?.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <TreeNode 
                    node={currentTree}
                    onDownload={handleDownload}
                    onFork={handleFork}
                    expanded={expandedNodes[currentTree.name]}
                    onToggle={toggleNode}
                  />
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Actions for this commit:</h4>
                  <div className="flex space-x-3">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                      Download All Files
                    </button>
                    <button 
                      onClick={() => handleFork("entire-project")}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Fork Project
                    </button>
                    <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                      Open in SolidWorks
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'files' && (
              <div className="text-center py-8 text-gray-500">
                <File className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Flat file list view - coming soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}