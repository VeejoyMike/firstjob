'use client'

import { useState } from 'react'
import { useEventStore } from '@/store/event-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Calendar, Clock, User, Edit, Trash2, LogOut, Users, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { AddEventDialog } from '@/components/add-event-dialog'
import { LoginForm } from '@/components/login-form'
import { RegisterForm } from '@/components/register-form'
import { UserManagement } from '@/components/user-management'
import { useReminder } from '@/hooks/use-reminder'

const statusMap = {
	'pending': { label: '待处理', color: 'bg-yellow-500' },
	'in-progress': { label: '进行中', color: 'bg-blue-500' },
	'completed': { label: '已完成', color: 'bg-green-500' }
}

export default function HomePage() {
	const { events, currentUser, isAuthenticated, logout, getUserById } = useEventStore()
	const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all')
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
	const [activeTab, setActiveTab] = useState('events')

	// 启用提醒功能（仅在已登录时）
	useReminder()

	// 如果未登录，显示登录/注册界面
	if (!isAuthenticated) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
				{authMode === 'login' ? (
					<LoginForm 
						onLoginSuccess={() => {
							setAuthMode('login')
							toast.success('欢迎回来！')
						}}
						onSwitchToRegister={() => setAuthMode('register')}
					/>
				) : (
					<RegisterForm 
						onRegisterSuccess={() => setAuthMode('login')}
						onSwitchToLogin={() => setAuthMode('login')}
					/>
				)}
			</main>
		)
	}

	const filteredEvents = events.filter(event => 
		filter === 'all' ? true : event.status === filter
	)

	const handleDeleteEvent = (id: string) => {
		const { deleteEvent } = useEventStore.getState()
		deleteEvent(id)
		toast.success('事件删除成功')
	}

	const handleStatusChange = (id: string, status: 'pending' | 'in-progress' | 'completed') => {
		const { updateEventStatus } = useEventStore.getState()
		updateEventStatus(id, status)
		toast.success('事件状态更新成功')
	}

	const handleLogout = () => {
		logout()
		toast.success('已退出登录')
	}

	const formatDateTime = (date: string, time: string) => {
		const dateObj = new Date(date + 'T' + time)
		return dateObj.toLocaleString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	return (
		<div className="container mx-auto py-8 px-4">
			{/* 头部 */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">事件管理系统</h1>
					<p className="text-gray-600 mt-2">欢迎回来，{currentUser?.name}！</p>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 text-sm text-gray-600">
						{currentUser?.role === 'admin' ? (
							<Crown className="w-4 h-4 text-yellow-500" />
						) : (
							<User className="w-4 h-4 text-gray-500" />
						)}
						<span>{currentUser?.role === 'admin' ? '管理员' : '普通用户'}</span>
					</div>
					<Button variant="outline" onClick={handleLogout}>
						<LogOut className="w-4 h-4 mr-2" />
						退出登录
					</Button>
				</div>
			</div>

			{/* 主要内容 */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="events">事件管理</TabsTrigger>
					<TabsTrigger value="users">
						<Users className="w-4 h-4 mr-2" />
						用户管理
						{currentUser?.role !== 'admin' && (
							<Badge variant="outline" className="ml-2 text-xs">管理员</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				{/* 事件管理标签页 */}
				<TabsContent value="events" className="space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold text-gray-900">事件看板</h2>
							<p className="text-gray-600 mt-1">管理和跟踪所有事件的进度</p>
						</div>
						<Button onClick={() => setIsAddDialogOpen(true)}>
							<Plus className="w-4 h-4 mr-2" />
							添加事件
						</Button>
					</div>

					{/* 筛选器 */}
					<div className="flex gap-2 mb-6">
						<Button
							variant={filter === 'all' ? 'default' : 'outline'}
							onClick={() => setFilter('all')}
						>
							全部 ({events.length})
						</Button>
						<Button
							variant={filter === 'pending' ? 'default' : 'outline'}
							onClick={() => setFilter('pending')}
						>
							待处理 ({events.filter(e => e.status === 'pending').length})
						</Button>
						<Button
							variant={filter === 'in-progress' ? 'default' : 'outline'}
							onClick={() => setFilter('in-progress')}
						>
							进行中 ({events.filter(e => e.status === 'in-progress').length})
						</Button>
						<Button
							variant={filter === 'completed' ? 'default' : 'outline'}
							onClick={() => setFilter('completed')}
						>
							已完成 ({events.filter(e => e.status === 'completed').length})
						</Button>
					</div>

					{/* 事件列表 */}
					{filteredEvents.length === 0 ? (
						<Card>
							<CardContent className="text-center py-8">
								<Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">暂无事件</h3>
								<p className="text-gray-500">点击"添加事件"按钮创建第一个事件</p>
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-4">
							{filteredEvents.map(event => {
								const user = getUserById(event.assignedUserId)
								const isOverdue = new Date(event.deadline + 'T' + event.time) < new Date()
								
								return (
									<Card key={event.id} className={`${isOverdue && event.status !== 'completed' ? 'border-red-500' : ''}`}>
										<CardHeader>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<CardTitle className="text-lg">{event.title}</CardTitle>
													<CardDescription className="mt-1">{event.description}</CardDescription>
												</div>
												<div className="flex items-center gap-2">
													<Badge className={`${statusMap[event.status].color} text-white`}>
														{statusMap[event.status].label}
													</Badge>
													{isOverdue && event.status !== 'completed' && (
														<Badge variant="destructive">已过期</Badge>
													)}
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
												<div className="flex items-center gap-2 text-sm text-gray-600">
													<Calendar className="w-4 h-4" />
													<span>截止: {formatDateTime(event.deadline, event.time)}</span>
												</div>
												<div className="flex items-center gap-2 text-sm text-gray-600">
													<User className="w-4 h-4" />
													<span>负责人: {user?.name || '未知用户'}</span>
												</div>
												<div className="flex items-center gap-2 text-sm text-gray-600">
													<Clock className="w-4 h-4" />
													<span>提醒: {event.reminderEnabled ? `${event.reminderInterval}分钟前` : '已关闭'}</span>
												</div>
											</div>
											
											<div className="flex gap-2">
												{event.status !== 'completed' && (
													<>
														<Button
															size="sm"
															variant="outline"
															onClick={() => handleStatusChange(event.id, 'in-progress')}
															disabled={event.status === 'in-progress'}
														>
															开始处理
														</Button>
														<Button
															size="sm"
															variant="outline"
															onClick={() => handleStatusChange(event.id, 'completed')}
														>
															标记完成
														</Button>
													</>
												)}
												{event.status === 'completed' && (
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleStatusChange(event.id, 'pending')}
													>
														重新打开
													</Button>
												)}
												<Button
													size="sm"
													variant="destructive"
													onClick={() => handleDeleteEvent(event.id)}
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</CardContent>
									</Card>
								)
							})}
						</div>
					)}
				</TabsContent>

				{/* 用户管理标签页 */}
				<TabsContent value="users">
					<UserManagement />
				</TabsContent>
			</Tabs>

			<AddEventDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
		</div>
	)
}
