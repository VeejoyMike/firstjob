'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calculator, Package, Truck, Info } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

// 集装箱尺寸（内部尺寸，单位：厘米）
const CONTAINER_DIMENSIONS = {
	'20ft': { length: 590, width: 235, height: 239 },
	'40ft': { length: 1200, width: 235, height: 239 }
}

export default function ContainerCalculatorPage() {
	const [productDimensions, setProductDimensions] = useState({
		length: '',
		width: '',
		height: ''
	})
	const [results, setResults] = useState<{
		'20ft': { count: number; arrangement: string };
		'40ft': { count: number; arrangement: string };
	} | null>(null)

	const calculateContainerCapacity = (containerType: '20ft' | '40ft') => {
		const container = CONTAINER_DIMENSIONS[containerType]
		const { length: l, width: w, height: h } = container
		
		const productL = parseFloat(productDimensions.length)
		const productW = parseFloat(productDimensions.width)
		const productH = parseFloat(productDimensions.height)

		if (!productL || !productW || !productH) return { count: 0, arrangement: '' }

		// 计算不同摆放方式的数量
		const arrangements = [
			Math.floor(l / productL) * Math.floor(w / productW) * Math.floor(h / productH),
			Math.floor(l / productW) * Math.floor(w / productL) * Math.floor(h / productH),
			Math.floor(l / productH) * Math.floor(w / productW) * Math.floor(h / productL),
			Math.floor(l / productL) * Math.floor(w / productH) * Math.floor(h / productW),
			Math.floor(l / productW) * Math.floor(w / productH) * Math.floor(h / productL),
			Math.floor(l / productH) * Math.floor(w / productL) * Math.floor(h / productW)
		]

		const maxCount = Math.max(...arrangements)
		const bestArrangementIndex = arrangements.indexOf(maxCount)
		
		const arrangementNames = [
			'原始方向',
			'长宽互换',
			'长高互换', 
			'宽高互换',
			'长宽高全换',
			'长高宽全换'
		]

		const arrangement = arrangementNames[bestArrangementIndex] ?? ''
		return {
			count: maxCount,
			arrangement
		}
	}

	const handleCalculate = () => {
		const { length, width, height } = productDimensions
		
		if (!length || !width || !height) {
			toast.error('请输入完整的产品尺寸')
			return
		}

		const lengthNum = parseFloat(length)
		const widthNum = parseFloat(width)
		const heightNum = parseFloat(height)

		if (lengthNum <= 0 || widthNum <= 0 || heightNum <= 0) {
			toast.error('产品尺寸必须大于0')
			return
		}

		const results = {
			'20ft': calculateContainerCapacity('20ft'),
			'40ft': calculateContainerCapacity('40ft')
		}

		setResults(results)
		toast.success('计算完成！')
	}

	const handleReset = () => {
		setProductDimensions({ length: '', width: '', height: '' })
		setResults(null)
		toast.success('已重置')
	}

	return (
		<main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<div className="mx-auto max-w-4xl space-y-6">
				{/* 标题 */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
						<Calculator className="h-8 w-8 text-blue-600" />
						装箱计算器
					</h1>
					<p className="text-gray-600">输入产品尺寸，计算集装箱装载数量</p>
				</div>

				{/* 输入表单 */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Package className="h-5 w-5" />
							产品尺寸
						</CardTitle>
						<CardDescription>请输入产品的长、宽、高（单位：厘米）</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="length">长度 (cm)</Label>
								<Input
									id="length"
									type="number"
									placeholder="例如：50"
									value={productDimensions.length}
									onChange={(e) => setProductDimensions(prev => ({ ...prev, length: e.target.value }))}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="width">宽度 (cm)</Label>
								<Input
									id="width"
									type="number"
									placeholder="例如：30"
									value={productDimensions.width}
									onChange={(e) => setProductDimensions(prev => ({ ...prev, width: e.target.value }))}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="height">高度 (cm)</Label>
								<Input
									id="height"
									type="number"
									placeholder="例如：20"
									value={productDimensions.height}
									onChange={(e) => setProductDimensions(prev => ({ ...prev, height: e.target.value }))}
								/>
							</div>
						</div>
						
						<div className="flex gap-3">
							<Button onClick={handleCalculate} className="flex-1">
								<Calculator className="h-4 w-4 mr-2" />
								计算装载数量
							</Button>
							<Button onClick={handleReset} variant="outline">
								重置
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* 集装箱信息 */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Truck className="h-5 w-5" />
							集装箱规格
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<h4 className="font-semibold text-blue-600">20尺标准集装箱</h4>
								<p className="text-sm text-gray-600">
									内部尺寸：590 × 235 × 239 cm<br />
									容积：约 33.1 立方米
								</p>
							</div>
							<div className="space-y-2">
								<h4 className="font-semibold text-blue-600">40尺标准集装箱</h4>
								<p className="text-sm text-gray-600">
									内部尺寸：1200 × 235 × 239 cm<br />
									容积：约 67.3 立方米
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 计算结果 */}
				{results && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="border-blue-200 bg-blue-50">
							<CardHeader>
								<CardTitle className="text-blue-800">20尺集装箱</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="text-center">
									<div className="text-3xl font-bold text-blue-600">{results['20ft'].count}</div>
									<div className="text-sm text-blue-700">件产品</div>
								</div>
								<Separator />
								<div className="text-sm text-blue-700">
									<div className="font-medium">最佳摆放方式：</div>
									<div>{results['20ft'].arrangement}</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-green-200 bg-green-50">
							<CardHeader>
								<CardTitle className="text-green-800">40尺集装箱</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="text-center">
									<div className="text-3xl font-bold text-green-600">{results['40ft'].count}</div>
									<div className="text-sm text-green-700">件产品</div>
								</div>
								<Separator />
								<div className="text-sm text-green-700">
									<div className="font-medium">最佳摆放方式：</div>
									<div>{results['40ft'].arrangement}</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* 使用说明 */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Info className="h-5 w-5" />
							使用说明
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-gray-600">
						<p>• 输入产品的长、宽、高尺寸（单位：厘米）</p>
						<p>• 系统会自动计算6种不同摆放方式的最佳装载数量</p>
						<p>• 计算结果包含20尺和40尺标准集装箱的装载能力</p>
						<p>• 建议预留5-10%的空间用于装卸和固定</p>
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
