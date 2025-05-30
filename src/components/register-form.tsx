'use client'

import { useState } from 'react'
import { useEventStore } from '@/store/event-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface RegisterFormProps {
  onRegisterSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onRegisterSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { register } = useEventStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('请输入用户名')
      return
    }
    
    if (!formData.email.trim()) {
      toast.error('请输入邮箱')
      return
    }
    
    if (!formData.password.trim()) {
      toast.error('请输入密码')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('两次密码输入不一致')
      return
    }
    
    if (formData.password.length < 6) {
      toast.error('密码长度至少6位')
      return
    }

    setIsLoading(true)
    
    // 模拟注册延迟
    setTimeout(() => {
      const success = register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'user' // 所有注册用户默认为普通用户
      })
      
      if (success) {
        toast.success('注册成功，请登录')
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        onRegisterSuccess?.()
      } else {
        toast.error('邮箱已被注册，请使用其他邮箱')
      }
      
      setIsLoading(false)
    }, 500)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>注册新账号</CardTitle>
        <CardDescription>创建您的普通用户账号以开始使用</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">用户名</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入用户名"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="请输入邮箱"
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
              placeholder="请输入密码（至少6位）"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="请再次输入密码"
              disabled={isLoading}
            />
          </div>
          
          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
            <p>📝 注册说明：</p>
            <ul className="mt-1 ml-4 list-disc">
              <li>新注册账号默认为普通用户权限</li>
              <li>如需管理员权限，请联系现有管理员</li>
            </ul>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '注册中...' : '注册为普通用户'}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <Button 
            variant="link" 
            className="text-sm"
            onClick={onSwitchToLogin}
          >
            已有账号？点击登录
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 