import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import animations from '../../assets/animations';

const LottieAnimation = ({
  animation,
  src,
  autoplay = true,
  loop = true,
  speed = 1,
  style = {},
  className = '',
  ...props
}) => {
  // Use predefined animation or custom src
  const animationSrc = animation ? animations[animation] : src;

  if (!animationSrc) {
    console.warn('LottieAnimation: No animation source provided');
    return null;
  }

  return (
    <Player
      autoplay={autoplay}
      loop={loop}
      speed={speed}
      src={animationSrc}
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
      className={className}
      {...props}
    />
  );
};

export default LottieAnimation;
