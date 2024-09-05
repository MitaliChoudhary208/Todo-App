import React, { useState, useEffect } from 'react';
import TodoItem from '../HomePage/TodoItem';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


interface Task {
  _id: string;
  title: string;
  description: string;
  userId: string; 
}

const Todo: React.FC = () => {
    const [todos, setTodos] = useState<Task[]>([]);
    const [formData, setFormData] = useState({ title: '', description: '' }); 
    const [isEditing, setIsEditing] = useState(false); 
    const [editId, setEditId] = useState<string | null>(null); 

    const navigate = useNavigate();


    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/getTask', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTodos(response.data);
            } catch (error:any) {
                console.error('Error fetching tasks', error);
                if (error.response?.status === 401) {
                    navigate('/login'); 
                }
            }
        };

        fetchTasks();
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token
        navigate('/login');
    };

    // Handle adding or updating tasks
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            if (isEditing && editId) {
               
                const response = await axios.put(
                    `http://localhost:5000/updateTask/${editId}`,
                    formData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            
                setTodos(todos.map(todo => todo._id === editId ? response.data : todo));
                setIsEditing(false);
                setEditId(null);
            } else {
                // Create new task
                const response = await axios.post(
                    'http://localhost:5000/createTask',
                    formData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setTodos([...todos, response.data]); 
            }

            setFormData({ title: '', description: '' }); 
        } catch (error) {
            console.error('Error submitting task', error);
        }
    };

  
    const handleDelete = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/deleteTask/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
         
            setTodos(todos.filter(todo => todo._id !== id));
        } catch (error) {
            console.error('Error deleting task', error);
        }
    };

  
    const handleEdit = (id: string, title: string, description: string) => {
        setFormData({ title, description });
        setIsEditing(true);
        setEditId(id);
    };

    return (
        <>
            <div className="bg-purple-600 p-4 rounded-t-lg flex justify-between items-center shadow-md">
                <h1 className="text-white text-2xl font-bold">Todo App</h1>
                <button 
                    onClick={handleLogout} 
                    className="text-white bg-red-500 hover:bg-red-600 py-2 px-4 rounded-md transition duration-300 ease-in-out">
                    Logout
                </button>
            </div>

            <div className="flex flex-col items-center justify-center bg-gray-50 py-6">
                <div className="w-full max-w-3xl mt-6 p-4 bg-white shadow-lg rounded-lg">
                    <div className="bg-purple-600 p-3 rounded-t-lg text-center">
                        <h1 className="text-white text-xl font-bold">{isEditing ? 'Edit Task' : 'Add Task'}</h1>
                    </div>
                    <div className="p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-700 font-medium">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="w-full bg-purple-600 text-white py-2 rounded-md mt-4 hover:bg-purple-700 transition duration-300 ease-in-out">
                                    {isEditing ? 'Update Task' : 'Add Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="w-full max-w-3xl mt-6 p-4 bg-white shadow-lg rounded-lg">
                    <div className="bg-purple-600 p-3 rounded-t-lg text-center">
                        <h1 className="text-white text-xl font-bold">TODO LIST</h1>
                    </div>
                    <div className="p-4 space-y-3">
                        {todos.length > 0 ? (
                            todos.map(todo => (
                                <TodoItem 
                                    key={todo._id} 
                                    id={todo._id} 
                                    title={todo.title} 
                                    subtitle={todo.description} 
                                    onDelete={handleDelete} 
                                    onEdit={handleEdit}
                                />
                            ))
                        ) : (
                            <p className="text-center text-gray-500 text-sm">No tasks added yet.</p>

                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Todo;
