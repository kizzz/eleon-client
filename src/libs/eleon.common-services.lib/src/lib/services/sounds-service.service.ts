import { ISoundsService } from '@eleon/contracts.lib'
import { Howl } from "howler";

export type DefaultSoundType = "notification-pop";

export class SoundsService extends ISoundsService {
  private sounds: { [key in DefaultSoundType]: Howl };

  constructor() {
    super();
    this.initSounds();
  }

  public play(sound: DefaultSoundType): void {
    this.sounds[sound].play();
  }

  private initSounds(): void {
    this.sounds = {
      "notification-pop": this.createHowl("short-pop.mp3"),
    };
  }

  private createHowl(mp3Name: string): Howl {
    return new Howl({
      src: ["assets/sounds/" + mp3Name],
    });
  }
}
