import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Save, 
  Calendar, 
  DollarSign, 
  User, 
  Loader2, 
  PieChart, 
  TrendingUp, 
  ListTodo, 
  Plus, 
  Link as LinkIcon, 
  Lock, 
  CheckCircle2, 
  Trash2,
  AlertCircle,
  GripVertical
} from "lucide-react";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { UserRole, ProjectItem } from "../../types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  projectToEdit?: ProjectItem | null; 
  userRole?: UserRole;
}

interface Task {
  id: string;
  title: string;
  status: 'PENDING' | 'COMPLETED';
  dependencies: string[]; // Array of Task IDs that must be completed first
}

export default function ProjectModal({ isOpen, onClose, onSave, projectToEdit, userRole = UserRole.ADMIN }: ProjectModalProps) {
  const { execute, isLoading } = useAsyncAction();
  const isAdmin = userRole === UserRole.ADMIN;
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    deadline: "",
    total_amount: "",
    cost: "",
    paul_share: "",
    status: "ACTIVE" as ProjectItem['status']
  });

  // Task State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);

  // Load Data if Editing
  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setFormData({
          title: projectToEdit.title || "",
          client_name: projectToEdit.client_name || "",
          deadline: projectToEdit.deadline || "",
          total_amount: projectToEdit.total_amount ? projectToEdit.total_amount.toString() : "0",
          cost: projectToEdit.cost ? projectToEdit.cost.toString() : "0",
          paul_share: projectToEdit.paul_share ? projectToEdit.paul_share.toString() : "0",
          status: projectToEdit.status || "ACTIVE"
        });
        // Mock loading tasks from project object (in a real app, this would come from the DB)
        // For existing projects without tasks, initialize empty
        setTasks((projectToEdit as any).tasks || []);
      } else {
        // Reset if Creating New
        setFormData({ title: "", client_name: "", deadline: "", total_amount: "", cost: "", paul_share: "", status: "ACTIVE" });
        setTasks([]);
      }
    }
  }, [projectToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await execute(async () => {
      // 1. Validation
      if (!formData.title.trim() || !formData.client_name.trim()) throw new Error("Title and Client are required.");

      const payload = {
        id: projectToEdit?.id,
        title: formData.title,
        client_name: formData.client_name,
        deadline: formData.deadline,
        total_amount: Number(formData.total_amount) || 0,
        cost: Number(formData.cost) || 0,
        paul_share: Number(formData.paul_share) || 0,
        status: formData.status,
        tasks: tasks // Save tasks with the project
      };

      await onSave(payload);
      onClose();
    }, projectToEdit ? "Project updated successfully" : "New project created");
  };

  // --- Task Logic Engine ---

  const handleAddTask = () => {
    if(!newTask.trim()) return;
    const task: Task = {
        id: `t-${Date.now()}`,
        title: newTask,
        status: 'PENDING',
        dependencies: []
    };
    setTasks([...tasks, task]);
    setNewTask("");
  };

  // Check if a task is locked by incomplete dependencies
  const getTaskLockState = (task: Task) => {
    if (!task.dependencies || task.dependencies.length === 0) return { isLocked: false, blockers: [] };
    
    const blockers = task.dependencies
      .map(depId => tasks.find(t => t.id === depId))
      .filter(t => t && t.status !== 'COMPLETED') as Task[];
      
    return { 
      isLocked: blockers.length > 0, 
      blockers 
    };
  };

  const toggleTaskStatus = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const { isLocked } = getTaskLockState(task);
    if (isLocked && task.status === 'PENDING') {
        // Prevent completing locked tasks
        return;
    }

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : t));
  };

  const toggleDependency = (childId: string, parentId: string) => {
    if (childId === parentId) return; // No self-dependency
    
    setTasks(prev => prev.map(t => {
        if (t.id !== childId) return t;
        const hasDep = t.dependencies.includes(parentId);
        return {
            ...t,
            dependencies: hasDep ? t.dependencies.filter(d => d !== parentId) : [...t.dependencies, parentId]
        };
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id).map(t => ({
        ...t,
        dependencies: t.dependencies.filter(d => d !== id) // Remove deleted task from others' dependencies
    })));
  };

  // --- Task DnD Handlers ---
  const handleTaskDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTaskIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50');
  };

  const handleTaskDragEnd = (e: React.DragEvent) => {
    setDraggedTaskIndex(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleTaskDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedTaskIndex === null || draggedTaskIndex === index) return;

    const newTasks = [...tasks];
    const draggedItem = newTasks[draggedTaskIndex];
    
    // Remove from old position
    newTasks.splice(draggedTaskIndex, 1);
    // Insert at new position
    newTasks.splice(index, 0, draggedItem);
    
    setTasks(newTasks);
    setDraggedTaskIndex(index);
  };

  const revenue = Number(formData.total_amount) || 0;
  const cost = Number(formData.cost) || 0;
  const commission = Number(formData.paul_share) || 0;
  const netProfit = revenue - cost - commission;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60]"
          />
          
          {/* Modal Panel */}
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-950/80 backdrop-blur-2xl border-l border-white/10 z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-bold text-white">
                {projectToEdit ? "Edit Project Logic" : "Initialize Project"}
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Title</label>
                  <input 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-colors"
                    placeholder="e.g. Q1 Marketing Campaign"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      value={formData.client_name}
                      onChange={e => setFormData({...formData, client_name: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 pl-12 text-white font-bold focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-colors"
                      placeholder="Client Company Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Deadline</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="date"
                      value={formData.deadline}
                      onChange={e => setFormData({...formData, deadline: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 pl-12 text-white font-bold focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-colors appearance-none"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Core */}
              <div className="pt-6 border-t border-white/5 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                   <PieChart size={16} className="text-teal-500" />
                   <h3 className="text-xs font-black text-white uppercase tracking-widest">Financial Matrix</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                    <span>Total Revenue</span>
                    {isAdmin && <span className="text-teal-400">Input Total Value</span>}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="number"
                      value={formData.total_amount}
                      onChange={e => setFormData({...formData, total_amount: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-white font-bold focus:border-teal-500/50 focus:bg-teal-500/5 outline-none transition-colors"
                      placeholder="0.00"
                      disabled={!isAdmin}
                    />
                  </div>
                </div>

                {isAdmin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cost Basis</label>
                      <input 
                        type="number"
                        value={formData.cost}
                        onChange={e => setFormData({...formData, cost: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-rose-200 font-bold focus:border-rose-500/50 focus:bg-rose-500/5 outline-none transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Partner Comm.</label>
                      <input 
                        type="number"
                        value={formData.paul_share}
                        onChange={e => setFormData({...formData, paul_share: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-amber-200 font-bold focus:border-amber-500/50 focus:bg-amber-500/5 outline-none transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                {/* Profit Calculator Visualization */}
                {isAdmin && (
                  <div className={`p-5 rounded-2xl border ${netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} flex items-center justify-between`}>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Profit Forecast</p>
                      <p className={`text-2xl font-black tracking-tighter ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        SAR {netProfit.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Margin</p>
                      <div className={`flex items-center justify-end gap-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        <TrendingUp size={16} />
                        <span className="text-xl font-black">{margin.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tasks & Dependencies Section */}
              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <ListTodo size={16} className="text-purple-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Task Dependencies & Workflow</h3>
                </div>

                <div className="flex gap-2">
                    <input 
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add new task (e.g. Site Survey)..."
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500/50 focus:bg-purple-500/5 outline-none transition-all placeholder:text-slate-600 font-medium"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                    />
                    <button onClick={handleAddTask} type="button" className="p-3 bg-purple-600 rounded-xl text-white hover:bg-purple-500 transition-colors shadow-lg active:scale-95">
                        <Plus size={18} />
                    </button>
                </div>

                <div className="space-y-2">
                    {tasks.length === 0 && (
                        <div className="p-6 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No tasks initialized</p>
                        </div>
                    )}
                    {tasks.map((task, idx) => {
                        const { isLocked, blockers } = getTaskLockState(task);
                        const isExpanded = expandedTaskId === task.id;
                        const isCompleted = task.status === 'COMPLETED';

                        // Dynamic styles for states
                        let wrapperStyle = "bg-white/5 border-white/5";
                        let textStyle = "text-slate-200";
                        
                        if (isCompleted) {
                            wrapperStyle = "bg-emerald-500/5 border-emerald-500/10 opacity-70";
                            textStyle = "text-emerald-200/50 line-through decoration-emerald-500/30";
                        } else if (isLocked) {
                            wrapperStyle = "bg-slate-900/50 border-red-500/10";
                            textStyle = "text-slate-500";
                        }

                        return (
                            <div 
                              key={task.id} 
                              draggable
                              onDragStart={(e) => handleTaskDragStart(e, idx)}
                              onDragEnd={handleTaskDragEnd}
                              onDragOver={(e) => handleTaskDragOver(e, idx)}
                              className={`border rounded-xl transition-all cursor-grab active:cursor-grabbing ${wrapperStyle}`}
                            >
                                <div className="flex items-center p-3 gap-3">
                                    <div className="cursor-grab text-slate-600 hover:text-slate-400">
                                       <GripVertical size={14} />
                                    </div>

                                    <button 
                                        type="button"
                                        onClick={() => toggleTaskStatus(task.id)}
                                        disabled={isLocked && !isCompleted}
                                        className={`shrink-0 p-2 rounded-lg border transition-all ${
                                            isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 
                                            isLocked ? 'bg-slate-950 border-slate-800 text-slate-700 cursor-not-allowed' : 
                                            'bg-black/40 border-white/20 text-transparent hover:border-white/40 hover:text-white/20'
                                        }`}
                                    >
                                        {isCompleted ? <CheckCircle2 size={14} /> : isLocked ? <Lock size={14} /> : <div className="w-3.5 h-3.5" />}
                                    </button>
                                    
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-sm font-bold block truncate ${textStyle}`}>
                                            {task.title}
                                        </span>
                                        {isLocked && !isCompleted && blockers.length > 0 && (
                                            <p className="text-[9px] font-bold text-red-400/60 uppercase tracking-wide flex items-center gap-1 mt-0.5">
                                                <Lock size={8} /> Waiting for: {blockers[0].title} {blockers.length > 1 && `+${blockers.length - 1}`}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button 
                                            type="button"
                                            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                                            className={`p-2 rounded-lg transition-colors ${task.dependencies.length > 0 ? 'text-purple-400 bg-purple-500/10' : 'text-slate-500 hover:text-white'}`}
                                            title="Manage Dependencies"
                                        >
                                            <LinkIcon size={14} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => deleteTask(task.id)}
                                            className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Dependencies Dropdown */}
                                {isExpanded && (
                                    <div className="bg-black/20 p-4 border-t border-white/5 space-y-3 animate-in slide-in-from-top-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                                <LinkIcon size={10} /> Link Prerequisites
                                            </p>
                                            <span className="text-[9px] text-slate-600">Select tasks that must finish first</span>
                                        </div>
                                        
                                        {tasks.filter(t => t.id !== task.id).length === 0 && <p className="text-[10px] text-slate-600 italic">No other tasks available to link.</p>}
                                        
                                        <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                                            {tasks.filter(t => t.id !== task.id).map(other => (
                                                <button
                                                    key={other.id}
                                                    type="button"
                                                    onClick={() => toggleDependency(task.id, other.id)}
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left group ${
                                                        task.dependencies.includes(other.id) ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'hover:bg-white/5 text-slate-500 border border-transparent'
                                                    }`}
                                                >
                                                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors ${
                                                        task.dependencies.includes(other.id) ? 'bg-purple-500 border-purple-500' : 'border-slate-600 group-hover:border-slate-400'
                                                    }`}>
                                                        {task.dependencies.includes(other.id) && <div className="w-1 h-1 bg-white rounded-full" />}
                                                    </div>
                                                    {other.title}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workflow State</label>
                <div className="grid grid-cols-3 gap-2">
                  {['ACTIVE', 'PENDING', 'COMPLETED'].map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setFormData({...formData, status: status as any})}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        formData.status === status 
                          ? "bg-blue-600 border-blue-500 text-white shadow-lg" 
                          : "bg-black/20 border-white/10 text-slate-500 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-black/20">
              <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-900/20"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Configuration</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}