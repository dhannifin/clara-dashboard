import express from 'express';

const router = express.Router();

// Mock Maple todos for now
router.get('/', (req, res) => {
  try {
    const mockTodos = [
      {
        id: 1,
        task: 'Review Clara Dashboard implementation',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000).toISOString()
      },
      {
        id: 2,
        task: 'Update OpenClaw documentation',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 172800000).toISOString()
      },
      {
        id: 3,
        task: 'Backup rotation cleanup',
        status: 'pending',
        priority: 'low',
        dueDate: new Date(Date.now() + 259200000).toISOString()
      },
      {
        id: 4,
        task: 'Check Docker container logs',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    const stats = {
      total: mockTodos.length,
      completed: mockTodos.filter(t => t.status === 'completed').length,
      inProgress: mockTodos.filter(t => t.status === 'in_progress').length,
      pending: mockTodos.filter(t => t.status === 'pending').length
    };

    res.json({
      success: true,
      data: {
        todos: mockTodos,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
