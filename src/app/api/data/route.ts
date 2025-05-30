import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// 数据类型定义
interface Comment {
  id: string
  eventId: string
  userId: string
  content: string
  createdAt: string
}

interface Event {
  id: string
  title: string
  description: string
  createdAt: string
  deadline: string
  time: string
  status: 'pending' | 'in-progress' | 'completed'
  assignedUserId: string
  reminderEnabled: boolean
  reminderInterval: number
  comments?: Comment[]
}

interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
  createdAt: string
}

interface AppData {
  events: Event[]
  users: User[]
  comments: Comment[]
}

// 数据文件路径
const dataFilePath = path.join(process.cwd(), 'data', 'app-data.json')

// 确保数据目录存在
function ensureDataDir() {
  const dataDir = path.dirname(dataFilePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// 读取数据
function readData(): AppData {
  ensureDataDir()
  
  if (!fs.existsSync(dataFilePath)) {
    // 初始化默认数据
    const defaultData: AppData = {
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
      comments: []
    }
    
    writeData(defaultData)
    return defaultData
  }
  
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading data file:', error)
    return { events: [], users: [], comments: [] }
  }
}

// 写入数据
function writeData(data: AppData) {
  ensureDataDir()
  
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing data file:', error)
  }
}

// GET - 获取所有数据
export async function GET() {
  try {
    const data = readData()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 })
  }
}

// POST - 根据action执行不同操作
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, payload } = body
    const data = readData()
    
    switch (action) {
      case 'ADD_EVENT':
        const newEvent: Event = {
          ...payload,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          comments: []
        }
        data.events.push(newEvent)
        break
        
      case 'UPDATE_EVENT':
        const { id: eventId, updates } = payload
        data.events = data.events.map(event =>
          event.id === eventId ? { ...event, ...updates } : event
        )
        break
        
      case 'DELETE_EVENT':
        const { id: deleteEventId } = payload
        data.events = data.events.filter(event => event.id !== deleteEventId)
        data.comments = data.comments.filter(comment => comment.eventId !== deleteEventId)
        break
        
      case 'ADD_COMMENT':
        const { eventId: commentEventId, content, userId: commentUserId } = payload
        const newComment: Comment = {
          id: Date.now().toString(),
          eventId: commentEventId,
          userId: commentUserId,
          content,
          createdAt: new Date().toISOString()
        }
        data.comments.push(newComment)
        break
        
      case 'ADD_USER':
        const existingUser = data.users.find(u => u.email === payload.email)
        if (existingUser) {
          return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }
        
        const newUser: User = {
          ...payload,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }
        data.users.push(newUser)
        break
        
      case 'UPDATE_USER':
        const { id: updateUserId, updates: userUpdates } = payload
        const existingEmail = data.users.find(u => u.email === userUpdates.email && u.id !== updateUserId)
        if (userUpdates.email && existingEmail) {
          return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
        }
        
        data.users = data.users.map(user =>
          user.id === updateUserId ? { ...user, ...userUpdates } : user
        )
        break
        
      case 'DELETE_USER':
        const { id: deleteUserId } = payload
        data.users = data.users.filter(user => user.id !== deleteUserId)
        break
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
    writeData(data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 