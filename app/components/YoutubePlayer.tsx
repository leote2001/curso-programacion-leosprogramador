export default function YoutubePlayer({videoSrc}: {videoSrc: string;}) {
return (
    <div className="relative w-full overflow-hidden pt-[56.25%] rounded-xl shadow-lg">
      <iframe
        className="absolute top-0 left-0 bottom-0 right-0 w-full h-full"
        src={videoSrc}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      ></iframe>
    </div>
  );
};

