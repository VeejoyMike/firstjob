'use client'

import { useState } from 'react'
import { useEventStore } from '@/store/event-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { User, Send } from 'lucide-react'
import { toast } from 'sonner'

interface EventCommentsProps {
  eventId: string
}

export function EventComments({ eventId }: EventCommentsProps) {
  const { getEventComments, addComment, getUserById, currentUser } = useEventStore()
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const comments = getEventComments(eventId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      toast.error('请输入评论内容')
      return
    }
    
    if (!currentUser) {
      toast.error('请先登录')
      return
    }

    setIsSubmitting(true)
    
    // 模拟提交延迟
    setTimeout(() => {
      addComment(eventId, newComment.trim())
      setNewComment('')
      setIsSubmitting(false)
      toast.success('评论发表成功')
    }, 200)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium">评论 ({comments.length})</h4>
      
      {/* 评论列表 */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.length > 0 ? (
          comments.map(comment => {
            const user = getUserById(comment.userId)
            return (
              <Card key={comment.id} className="p-3">
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {user?.name || '未知用户'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          <div className="text-center text-gray-500 py-4">
            <p className="text-sm">还没有评论，来发表第一个吧！</p>
          </div>
        )}
      </div>
      
      {/* 发表评论 */}
      {currentUser && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="发表你的看法..."
            rows={3}
            disabled={isSubmitting}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="sm"
              disabled={isSubmitting || !newComment.trim()}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? '发表中...' : '发表评论'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
} 