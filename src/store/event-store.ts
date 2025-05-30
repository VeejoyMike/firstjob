import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  
  // 用户认证
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (userData: Omit<User, 'id' | 'createdAt'>) => boolean
  
  // 事件管理
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void
  updateEvent: (id: string, updates: Partial<Event>) => void
  deleteEvent: (id: string) => void
  updateEventStatus: (id: string, status: Event['status']) => void
  
  // 评论管理
  addComment: (eventId: string, content: string) => void
  getEventComments: (eventId: string) => Comment[]
  
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
          name: '王经理', 
          email: 'manager@wuhu-weiju.com', 
          password: '123456',
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        { 
          id: '2', 
          name: '张业务', 
          email: 'sales@wuhu-weiju.com', 
          password: '123456',
          role: 'user',
          createdAt: new Date().toISOString()
        },
        { 
          id: '3', 
          name: '李财务', 
          email: 'finance@wuhu-weiju.com', 
          password: '123456',
          role: 'user',
          createdAt: new Date().toISOString()
        },
        { 
          id: '4', 
          name: '赵客服', 
          email: 'service@wuhu-weiju.com', 
          password: '123456',
          role: 'user',
          createdAt: new Date().toISOString()
        }
      ],
      comments: [],
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
          createdAt: new Date().toISOString(),
          comments: []
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
          events: state.events.filter(event => event.id !== id),
          comments: state.comments.filter(comment => comment.eventId !== id)
        }))
      },
      
      updateEventStatus: (id, status) => {
        set((state) => ({
          events: state.events.map(event =>
            event.id === id ? { ...event, status } : event
          )
        }))
      },
      
      // 评论管理方法
      addComment: (eventId, content) => {
        const currentUser = get().currentUser
        if (!currentUser) return
        
        const newComment: Comment = {
          id: Date.now().toString(),
          eventId,
          userId: currentUser.id,
          content,
          createdAt: new Date().toISOString()
        }
        
        set((state) => ({
          comments: [...state.comments, newComment]
        }))
      },
      
      getEventComments: (eventId) => {
        return get().comments.filter(comment => comment.eventId === eventId)
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
      name: 'wuhu-weiju-storage'
    }
  )
) 