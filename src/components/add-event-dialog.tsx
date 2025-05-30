'use client'

import { useState } from 'react'
import { useEventStore } from '@/store/event-store'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddEventDialog({ open, onOpenChange }: AddEventDialogProps) {
  const { users, addEvent } = useEventStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    time: '',
    status: 'pending' as 'pending' | 'in-progress' | 'completed',
    assignedUserId: '',
    reminderEnabled: true,
    reminderInterval: 30
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('请输入事件标题')
      return
    }
    
    if (!formData.deadline) {
      toast.error('请选择截止日期')
      return
    }
    
    if (!formData.time) {
      toast.error('请选择截止时间')
      return
    }
    
    if (!formData.assignedUserId) {
      toast.error('请选择负责人')
      return
    }

    try {
      await addEvent({
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        time: formData.time,
        status: formData.status,
        assignedUserId: formData.assignedUserId,
        reminderEnabled: formData.reminderEnabled,
        reminderInterval: formData.reminderInterval
      })

      toast.success('事件创建成功')
      onOpenChange(false)
      
      // 重置表单
      setFormData({
        title: '',
        description: '',
        deadline: '',
        time: '',
        status: 'pending',
        assignedUserId: '',
        reminderEnabled: true,
        reminderInterval: 30
      })
    } catch (error) {
      toast.error('创建失败，请重试')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加新事件</DialogTitle>
          <DialogDescription>
            创建一个新的事件并设置提醒。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">事件标题*</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="输入事件标题"
            />
          </div>

          <div>
            <Label htmlFor="description">事件描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="输入事件描述"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deadline">截止日期*</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="time">截止时间*</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>负责人*</Label>
            <Select
              value={formData.assignedUserId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, assignedUserId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择负责人" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>事件状态</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'pending' | 'in-progress' | 'completed') => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="in-progress">进行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="reminder">启用提醒</Label>
            <Switch
              id="reminder"
              checked={formData.reminderEnabled}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, reminderEnabled: checked }))
              }
            />
          </div>

          {formData.reminderEnabled && (
            <div>
              <Label htmlFor="reminderInterval">提醒间隔（分钟）</Label>
              <Input
                id="reminderInterval"
                type="number"
                min="1"
                max="1440"
                value={formData.reminderInterval}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  reminderInterval: parseInt(e.target.value) || 30 
                }))}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">
              添加事件
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 