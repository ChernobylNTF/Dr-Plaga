interface TokenDisplayProps {
  tokens: number
}

export default function TokenDisplay({ tokens }: TokenDisplayProps) {
  return (
    <div className="absolute top-32 left-2 bg-black bg-opacity-50 px-3 py-1 rounded-md z-50 mt-2">
      <div className="flex items-center">
        <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2 flex items-center justify-center text-xs font-bold">
          D
        </div>
        <span className="font-bold text-yellow-400">DSY: {tokens}</span>
      </div>
    </div>
  )
}
