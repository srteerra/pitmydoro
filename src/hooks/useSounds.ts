import { Howl } from 'howler';

export const useSounds = () => {
  const playSound = () => {
    const sound = new Howl({
      src: ['sounds/play.mp3'],
    });

    sound.play();
  };

  const resumeSound = () => {
    const sound = new Howl({
      src: ['sounds/resume.mp3'],
    });

    sound.play();
  };

  const radioSound = () => {
    const sound = new Howl({
      src: ['sounds/radio.mp3'],
    });

    sound.play();
  };

  return {
    playSound,
    resumeSound,
    radioSound,
  };
};
