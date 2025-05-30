'use client'

import { useState } from 'react'
import { useEventStore } from '@/store/event-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, User } from 'lucide-react'
import { toast } from 'sonner'

interface LoginFormProps {
  onLoginSuccess?: () => void
  onSwitchToRegister?: () => void
}

export function LoginForm({ onLoginSuccess, onSwitchToRegister }: LoginFormProps) {
  const { login, users } = useEventStore()
  const [formData, setFormData] = useState({
    emailOrName: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.emailOrName.trim()) {
      toast.error('请输入用户名或邮箱')
      return
    }
    
    if (!formData.password.trim()) {
      toast.error('请输入密码')
      return
    }

    setIsLoading(true)
    
    // 模拟登录延迟
    setTimeout(() => {
      const success = login(formData.emailOrName, formData.password)
      
      if (success) {
        toast.success('登录成功')
        onLoginSuccess?.()
      } else {
        toast.error('用户名/邮箱或密码错误')
      }
      
      setIsLoading(false)
    }, 500)
  }

  const handleQuickLogin = (user: any) => {
    setFormData({ emailOrName: user.email, password: user.password })
    // 自动登录
    setTimeout(() => {
      const success = login(user.email, user.password)
      if (success) {
        toast.success(`欢迎回来，${user.name}！`)
        onLoginSuccess?.()
      }
    }, 100)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>芜湖市微聚贸易有限公司</CardTitle>
        <CardDescription>日常看板 - 请登录以继续使用</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailOrName">用户名或邮箱</Label>
            <Input
              id="emailOrName"
              value={formData.emailOrName}
              onChange={(e) => setFormData(prev => ({ ...prev, emailOrName: e.target.value }))}
              placeholder="请输入用户名或邮箱"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="请输入密码"
              disabled={isLoading}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </form>
        
        {/* 快速登录区域 */}
        <div className="mt-6">
          <div className="text-center text-sm text-gray-600 mb-3">
            <p>快速登录：</p>
          </div>
          
          <div className="space-y-2">
            {users.map(user => (
              <Button 
                key={user.id}
                variant="outline" 
                size="sm" 
                className="w-full text-xs justify-start"
                onClick={() => handleQuickLogin(user)}
              >
                <div className="flex items-center gap-2">
                  {user.role === 'admin' ? (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  ) : (
                    <User className="w-3 h-3 text-gray-500" />
                  )}
                  <span>{user.name}</span>
                  <span className="text-gray-400">({user.role === 'admin' ? '管理员' : '员工'})</span>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              className="text-sm"
              onClick={onSwitchToRegister}
            >
              没有账号？点击注册
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 