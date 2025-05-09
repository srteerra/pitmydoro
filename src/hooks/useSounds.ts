import {Howl, Howler} from 'howler';

export const useSounds = () => {
  const playSound = () => {
    var sound = new Howl({
      src: ['sounds/play.mp3']
    });

    sound.play();
  }

  const resumeSound = () => {
    var sound = new Howl({
      src: ['sounds/resume.mp3']
    });

    sound.play();
  }

  const radioSound = () => {
    var sound = new Howl({
      src: ['sounds/radio.mp3']
    });

    sound.play();
  }

  return {
    playSound,
    resumeSound,
    radioSound
  }
}