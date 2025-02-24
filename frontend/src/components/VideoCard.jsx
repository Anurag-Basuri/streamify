const VideoCard = ({ video }) => {
  return (
    <div className="group bg-dark-800 rounded-xl overflow-hidden hover:bg-dark-750 transition-colors">
      <div className="relative aspect-video">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-dark-900/80 px-2 py-1 text-xs rounded">
          {video.duration}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-100 line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors">
          {video.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center">
              {video.channel.avatar ? (
                <img 
                  src={video.channel.avatar} 
                  className="rounded-full" 
                  alt={video.channel.name} 
                />
              ) : (
                <User className="text-gray-400" size={16} />
              )}
            </div>
            <span className="text-sm text-gray-400">{video.channel.name}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-500 text-sm">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{video.views}</span>
            </div>
            <span>•</span>
            <span>{video.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;