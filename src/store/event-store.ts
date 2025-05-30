import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  currentUser: User | null
  isAuthenticated: boolean
  
  // 用户认证
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (userData: Omit<User, 'id' | 'createdAt'>) => boolean
  
  // 事件管理
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void
  updateEvent: (id: string, updates: Partial<Event>) => void
  deleteEvent: (id: string) => void
  updateEventStatus: (id: string, status: Event['status']) => void
  
  // 用户管理
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => boolean
  updateUser: (id: string, updates: Partial<Omit<User, 'id'>>) => boolean
  deleteUser: (id: string) => void
  getUserById: (id: string) => User | undefined
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [],
      users: [
        { 
          id: '1', 
          name: '管理员', 
          email: 'admin@demo.com', 
          password: '123456',
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        { 
          id: '2', 
          name: '张三', 
          email: 'zhangsan@demo.com', 
          password: '123456',
          role: 'user',
          createdAt: new Date().toISOString()
        },
        { 
          id: '3', 
          name: '李四', 
          email: 'lisi@demo.com', 
          password: '123456',
          role: 'user',
          createdAt: new Date().toISOString()
        },
        { 
          id: '4', 
          name: '王五', 
          email: 'wangwu@demo.com', 
          password: '123456',
          role: 'user',
          createdAt: new Date().toISOString()
        }
      ],
      currentUser: null,
      isAuthenticated: false,

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

      register: (userData) => {
        const existingUser = get().users.find(u => u.email === userData.email)
        if (existingUser) {
          return false // 用户已存在
        }
        
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }
        
        set((state) => ({ users: [...state.users, newUser] }))
        return true
      },
      
      // 事件管理方法
      addEvent: (eventData) => {
        const newEvent: Event = {
          ...eventData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }
        set((state) => ({ events: [...state.events, newEvent] }))
      },
      
      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map(event =>
            event.id === id ? { ...event, ...updates } : event
          )
        }))
      },
      
      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter(event => event.id !== id)
        }))
      },
      
      updateEventStatus: (id, status) => {
        set((state) => ({
          events: state.events.map(event =>
            event.id === id ? { ...event, status } : event
          )
        }))
      },
      
      // 用户管理方法
      addUser: (userData) => {
        const existingUser = get().users.find(u => u.email === userData.email)
        if (existingUser) {
          return false // 用户已存在
        }
        
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }
        
        set((state) => ({ users: [...state.users, newUser] }))
        return true
      },

      updateUser: (id, updates) => {
        const existingUser = get().users.find(u => u.email === updates.email && u.id !== id)
        if (updates.email && existingUser) {
          return false // 邮箱已被其他用户使用
        }
        
        set((state) => ({
          users: state.users.map(user =>
            user.id === id ? { ...user, ...updates } : user
          )
        }))
        
        // 如果修改的是当前用户，更新当前用户信息
        const currentUser = get().currentUser
        if (currentUser && currentUser.id === id) {
          const updatedUser = get().users.find(u => u.id === id)
          if (updatedUser) {
            set({ currentUser: updatedUser })
          }
        }
        
        return true
      },
      
      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter(user => user.id !== id)
        }))
      },
      
      getUserById: (id) => {
        return get().users.find(user => user.id === id)
      }
    }),
    {
      name: 'event-storage'
    }
  )
) 