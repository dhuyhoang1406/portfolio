// Put your own click audio in public/sounds/clickMouseSound.mp3.
// Create the player only after a desktop interaction; never autoplay.
let player: HTMLAudioElement | undefined;
export function playClick() {
  player ??= new Audio(`${import.meta.env.BASE_URL}sounds/clickMouseSound.mp3`);
  player.currentTime = 0;
  // A missing file or blocked playback must not interrupt desktop actions.
  void player.play().catch(() => {});
}
