'use client'

import { useState } from 'react'
import { useEventStore } from '@/store/event-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

  const handleDemoLogin = (userType: 'admin' | 'user') => {
    if (userType === 'admin') {
      setFormData({ emailOrName: 'admin@demo.com', password: '123456' })
    } else {
      setFormData({ emailOrName: 'zhangsan@demo.com', password: '123456' })
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>事件管理系统</CardTitle>
        <CardDescription>请登录以继续使用</CardDescription>
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
        
        {/* 演示账号 */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>演示账号：</p>
          <p>管理员：admin@demo.com 或 管理员 / 123456</p>
          <p>用户：zhangsan@demo.com 或 张三 / 123456</p>
          
          <div className="mt-2">
            <Button 
              variant="link" 
              className="text-sm"
              onClick={onSwitchToRegister}
            >
              没有账号？点击注册
            </Button>
          </div>
          
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs mr-2"
              onClick={() => handleDemoLogin('admin')}
            >
              快速登录：管理员
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => handleDemoLogin('user')}
            >
              快速登录：普通用户
            </Button>
          </div>
          
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => toast.info(`当前有 ${users.length} 个用户`)}
            >
              调试：查看用户列表 ({users.length})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 