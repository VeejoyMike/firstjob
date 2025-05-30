import { create } from 'zustand'

export interface Comment {
  id: string
  eventId: string
  userId: string
  content: string
  createdAt: string
}

export interface Event {
  id: string
  title: string
  description: string
  createdAt: string
  deadline: string
  time: string
  status: 'pending' | 'in-progress' | 'completed'
  assignedUserId: string
  reminderEnabled: boolean
  reminderInterval: number // 提醒间隔（分钟）
  comments?: Comment[] // 事件评论
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
  createdAt: string
}

interface EventStore {
  events: Event[]
  users: User[]
  comments: Comment[]
  currentUser: User | null
  isAuthenticated: boolean
  loading: boolean
  
  // 数据加载
  fetchData: () => Promise<void>
  
  // 用户认证
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>
  
  // 事件管理
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<void>
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  updateEventStatus: (id: string, status: Event['status']) => Promise<void>
  
  // 评论管理
  addComment: (eventId: string, content: string) => Promise<void>
  getEventComments: (eventId: string) => Comment[]
  
  // 用户管理
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>
  updateUser: (id: string, updates: Partial<Omit<User, 'id'>>) => Promise<boolean>
  deleteUser: (id: string) => Promise<void>
  getUserById: (id: string) => User | undefined
}

// API调用函数
async function apiCall(action: string, payload?: any) {
  const response = await fetch('/api/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, payload }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'API call failed')
  }
  
  return response.json()
}

// 获取数据
async function fetchData() {
  const response = await fetch('/api/data')
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  users: [],
  comments: [],
  currentUser: null,
  isAuthenticated: false,
  loading: false,

  // 数据加载方法
  fetchData: async () => {
    set({ loading: true })
    try {
      const data = await fetchData()
      set({ 
        events: data.events || [],
        users: data.users || [],
        comments: data.comments || [],
        loading: false
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
      set({ loading: false })
    }
  },

  // 用户认证方法
  login: (email, password) => {
    const user = get().users.find(u => 
      (u.email === email || u.name === email) && u.password === password
    )
    if (user) {
      set({ currentUser: user, isAuthenticated: true })
      return true
    }
    return false
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false })
  },

  register: async (userData) => {
    try {
      const data = await apiCall('ADD_USER', userData)
      set({ users: data.users })
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  },
  
  // 事件管理方法
  addEvent: async (eventData) => {
    try {
      const data = await apiCall('ADD_EVENT', eventData)
      set({ events: data.events })
    } catch (error) {
      console.error('Failed to add event:', error)
      throw error
    }
  },
  
  updateEvent: async (id, updates) => {
    try {
      const data = await apiCall('UPDATE_EVENT', { id, updates })
      set({ events: data.events })
    } catch (error) {
      console.error('Failed to update event:', error)
      throw error
    }
  },
  
  deleteEvent: async (id) => {
    try {
      const data = await apiCall('DELETE_EVENT', { id })
      set({ events: data.events, comments: data.comments })
    } catch (error) {
      console.error('Failed to delete event:', error)
      throw error
    }
  },
  
  updateEventStatus: async (id, status) => {
    try {
      const data = await apiCall('UPDATE_EVENT', { id, updates: { status } })
      set({ events: data.events })
    } catch (error) {
      console.error('Failed to update event status:', error)
      throw error
    }
  },
  
  // 评论管理方法
  addComment: async (eventId, content) => {
    const currentUser = get().currentUser
    if (!currentUser) return
    
    try {
      const data = await apiCall('ADD_COMMENT', { 
        eventId, 
        content, 
        userId: currentUser.id 
      })
      set({ comments: data.comments })
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  },
  
  getEventComments: (eventId) => {
    return get().comments.filter(comment => comment.eventId === eventId)
  },
  
  // 用户管理方法
  addUser: async (userData) => {
    try {
      const data = await apiCall('ADD_USER', userData)
      set({ users: data.users })
      return true
    } catch (error) {
      console.error('Failed to add user:', error)
      return false
    }
  },

  updateUser: async (id, updates) => {
    try {
      const data = await apiCall('UPDATE_USER', { id, updates })
      set({ users: data.users })
      
      // 如果修改的是当前用户，更新当前用户信息
      const currentUser = get().currentUser
      if (currentUser && currentUser.id === id) {
        const updatedUser = data.users.find((u: User) => u.id === id)
        if (updatedUser) {
          set({ currentUser: updatedUser })
        }
      }
      
      return true
    } catch (error) {
      console.error('Failed to update user:', error)
      return false
    }
  },
  
  deleteUser: async (id) => {
    try {
      const data = await apiCall('DELETE_USER', { id })
      set({ users: data.users })
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  },
  
  getUserById: (id) => {
    return get().users.find(user => user.id === id)
  }
})) 