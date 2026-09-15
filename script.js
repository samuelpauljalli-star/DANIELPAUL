/* ==========================================================================
   THE WEDDING MOMENT - DANIEL PAUL & ESTHER (CHRISTIAN HOLY MATRIMONY)
   JAVASCRIPT CONTROLLER WITH VIDEO PASSCODE LOCK & DYNAMIC ACTIONS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. Security & Passcode Lock for song.mp4
     -------------------------------------------------------------------------- */
  // Accepted family passcodes (Year of wedding, couple names)
  const VALID_PASSCODES = ['2026', '7777', 'daniel', 'esther', 'dp2026'];
  
  let isVideoUnlocked = sessionStorage.getItem('wedding_video_unlocked') === 'true';

  const videoLockModal = document.getElementById('videoLockModal');
  const lockModalCard = document.getElementById('lockModalCard');
  const lockModalCloseBtn = document.getElementById('lockModalCloseBtn');
  const passcodeForm = document.getElementById('passcodeForm');
  const videoPasscodeInput = document.getElementById('videoPasscodeInput');
  const passcodeToggleBtn = document.getElementById('passcodeToggleBtn');
  const lockErrorMsg = document.getElementById('lockErrorMsg');
  const videoPlayerContainer = document.getElementById('videoPlayerContainer');
  const lockPlayLabel = document.getElementById('lockPlayLabel');
  const lockStatusHint = document.getElementById('lockStatusHint');
  const videoSecurityBadge = document.getElementById('videoSecurityBadge');
  const lockToggleBtn = document.getElementById('lockToggleBtn');
  const restartVideoBtn = document.getElementById('restartVideoBtn');

  function updateLockUI() {
    if (isVideoUnlocked) {
      if (videoPlayerContainer) videoPlayerContainer.classList.remove('is-locked');
      if (lockPlayLabel) lockPlayLabel.textContent = 'Play Wedding Reel';
      if (lockStatusHint) lockStatusHint.textContent = 'Click to Play in Fullscreen Theater';
      if (videoSecurityBadge) {
        videoSecurityBadge.textContent = '🔓 Unlocked';
        videoSecurityBadge.style.background = 'rgba(76, 175, 80, 0.2)';
        videoSecurityBadge.style.color = '#81c784';
        videoSecurityBadge.style.borderColor = 'rgba(76, 175, 80, 0.4)';
      }
      if (lockToggleBtn) lockToggleBtn.style.display = 'inline-flex';
      if (restartVideoBtn) restartVideoBtn.style.display = 'inline-flex';
    } else {
      if (videoPlayerContainer) videoPlayerContainer.classList.add('is-locked');
      if (lockPlayLabel) lockPlayLabel.textContent = '🔒 Protected Video Reel';
      if (lockStatusHint) lockStatusHint.textContent = 'Enter Passcode to Unlock & Play';
      if (videoSecurityBadge) {
        videoSecurityBadge.textContent = '🔒 Locked / Private';
        videoSecurityBadge.style.background = 'rgba(229, 193, 88, 0.15)';
        videoSecurityBadge.style.color = 'var(--gold-light)';
        videoSecurityBadge.style.borderColor = 'rgba(229, 193, 88, 0.3)';
      }
      if (lockToggleBtn) lockToggleBtn.style.display = 'none';
      if (restartVideoBtn) restartVideoBtn.style.display = 'none';
    }
  }

  function openLockModal() {
    if (!videoLockModal) return;
    videoLockModal.classList.add('active');
    if (lockErrorMsg) lockErrorMsg.classList.remove('show');
    if (videoPasscodeInput) {
      videoPasscodeInput.value = '';
      setTimeout(() => videoPasscodeInput.focus(), 100);
    }
  }

  function closeLockModal() {
    if (!videoLockModal) return;
    videoLockModal.classList.remove('active');
  }

  if (lockModalCloseBtn) lockModalCloseBtn.addEventListener('click', closeLockModal);

  if (videoLockModal) {
    videoLockModal.addEventListener('click', (e) => {
      if (e.target === videoLockModal) closeLockModal();
    });
  }

  // Toggle Passcode Visibility
  if (passcodeToggleBtn && videoPasscodeInput) {
    passcodeToggleBtn.addEventListener('click', () => {
      const isPassword = videoPasscodeInput.type === 'password';
      videoPasscodeInput.type = isPassword ? 'text' : 'password';
      passcodeToggleBtn.textContent = isPassword ? '🔒' : '👁';
    });
  }

  // Passcode Form Submit
  if (passcodeForm) {
    passcodeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = videoPasscodeInput.value.trim().toLowerCase();

      if (VALID_PASSCODES.includes(entered)) {
        // Success Unlock!
        isVideoUnlocked = true;
        sessionStorage.setItem('wedding_video_unlocked', 'true');
        updateLockUI();
        closeLockModal();
        triggerCelebration();
        showToast('🔓 Video Unlocked Successfully! Playing Wedding Reel...');

        // Auto play
        setTimeout(() => {
          openCinemaModal('song.mp4', '✨ Daniel Paul & Esther — Wedding Moment Reel', 0);
        }, 400);
      } else {
        // Invalid passcode
        if (lockErrorMsg) lockErrorMsg.classList.add('show');
        if (lockModalCard) {
          lockModalCard.classList.remove('lock-shake-anim');
          void lockModalCard.offsetWidth; // trigger reflow
          lockModalCard.classList.add('lock-shake-anim');
        }
        showToast('🔒 Access Denied: Incorrect Passcode');
      }
    });
  }

  // Re-lock Action
  if (lockToggleBtn) {
    lockToggleBtn.addEventListener('click', () => {
      isVideoUnlocked = false;
      sessionStorage.removeItem('wedding_video_unlocked');
      if (weddingVideo) weddingVideo.pause();
      updateLockUI();
      showToast('🔒 Wedding Reel has been locked again.');
    });
  }

  updateLockUI();


  /* --------------------------------------------------------------------------
     2. Mobile Menu Drawer Controller
     -------------------------------------------------------------------------- */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav-link, .mobile-rsvp-item a');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('open');
    });

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }


  /* --------------------------------------------------------------------------
     3. Cinema Modal (Full Screen Big Theater for YouTube & Videos)
     -------------------------------------------------------------------------- */
  const cinemaModal = document.getElementById('cinemaModal');
  const cinemaModalVideo = document.getElementById('cinemaModalVideo');
  const cinemaModalIframe = document.getElementById('cinemaModalIframe');
  const cinemaTitle = document.getElementById('cinemaTitle');
  const cinemaCloseBtn = document.getElementById('cinemaCloseBtn');
  const cinemaNativeFullscreenBtn = document.getElementById('cinemaNativeFullscreenBtn');

  function isYouTubeVideo(src) {
    if (!src) return false;
    return src.includes('youtube.com') || src.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(src);
  }

  function getYouTubeId(src) {
    if (/^[a-zA-Z0-9_-]{11}$/.test(src)) return src;
    const match = src.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : 'VERYuDOpNYY';
  }

  function openCinemaModal(videoSrc, titleText, currentTime = 0) {
    if (!cinemaModal) return;
    
    // Pause any inline playing videos
    if (weddingVideo && !weddingVideo.paused) weddingVideo.pause();

    if (cinemaTitle) cinemaTitle.textContent = titleText;

    if (isYouTubeVideo(videoSrc)) {
      const ytId = getYouTubeId(videoSrc);
      if (cinemaModalVideo) {
        cinemaModalVideo.pause();
        cinemaModalVideo.style.display = 'none';
      }
      if (cinemaModalIframe) {
        cinemaModalIframe.style.display = 'block';
        cinemaModalIframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`;
      }
    } else {
      if (cinemaModalIframe) {
        cinemaModalIframe.src = '';
        cinemaModalIframe.style.display = 'none';
      }
      if (cinemaModalVideo) {
        cinemaModalVideo.style.display = 'block';
        cinemaModalVideo.src = videoSrc;
        cinemaModalVideo.currentTime = currentTime;
        cinemaModalVideo.play().catch(() => {});
      }
    }

    cinemaModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // On mobile devices with HTML5 video, try native fullscreen if supported
    if (!isYouTubeVideo(videoSrc) && window.innerWidth <= 768 && cinemaModalVideo && cinemaModalVideo.webkitEnterFullscreen) {
      cinemaModalVideo.webkitEnterFullscreen();
    }
  }

  function closeCinemaModal() {
    if (!cinemaModal) return;
    if (cinemaModalVideo) {
      cinemaModalVideo.pause();
      cinemaModalVideo.style.display = 'none';
    }
    if (cinemaModalIframe) {
      cinemaModalIframe.src = '';
      cinemaModalIframe.style.display = 'none';
    }
    cinemaModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (cinemaCloseBtn) cinemaCloseBtn.addEventListener('click', closeCinemaModal);

  if (cinemaNativeFullscreenBtn && cinemaModalVideo) {
    cinemaNativeFullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        if (cinemaModal.requestFullscreen) {
          cinemaModal.requestFullscreen();
        } else if (cinemaModalVideo.webkitRequestFullscreen) {
          cinemaModalVideo.webkitRequestFullscreen();
        } else if (cinemaModalVideo.webkitEnterFullscreen) {
          cinemaModalVideo.webkitEnterFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (videoLockModal && videoLockModal.classList.contains('active')) {
        closeLockModal();
      }
      if (cinemaModal && cinemaModal.classList.contains('active')) {
        closeCinemaModal();
      }
    }
  });


  /* --------------------------------------------------------------------------
     4. Video 1: Wedding Reel (song.mp4) with Lock Verification
     -------------------------------------------------------------------------- */
  const weddingVideo = document.getElementById('weddingVideo');
  const bigPlayBtn = document.getElementById('bigPlayBtn');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const timelineContainer = document.getElementById('timelineContainer');
  const progressBar = document.getElementById('progressBar');
  const progressBuffer = document.getElementById('progressBuffer');
  const currentTimeEl = document.getElementById('currentTime');
  const durationTimeEl = document.getElementById('durationTime');
  const muteBtn = document.getElementById('muteBtn');
  const volumeHighIcon = document.getElementById('volumeHighIcon');
  const volumeMutedIcon = document.getElementById('volumeMutedIcon');
  const volumeSlider = document.getElementById('volumeSlider');
  const speedToggleBtn = document.getElementById('speedToggleBtn');
  const openModalReelBtn = document.getElementById('openModalReelBtn');
  const fullscreenReelDirectBtn = document.getElementById('fullscreenReelDirectBtn');
  const heroPlayReelBtn = document.getElementById('heroPlayReelBtn');
  const bigPlayOverlay = document.getElementById('bigPlayOverlay');

  // Ambient Backlight Canvas
  const ambientCanvas = document.getElementById('videoAmbientCanvas');
  const ambientCtx = ambientCanvas ? ambientCanvas.getContext('2d') : null;

  // Mini PIP Player elements
  const pipMiniPlayer = document.getElementById('pipMiniPlayer');
  const pipCloseBtn = document.getElementById('pipCloseBtn');
  const pipBody = document.getElementById('pipBody');
  const pipCanvas = document.getElementById('pipCanvas');
  const pipCtx = pipCanvas ? pipCanvas.getContext('2d') : null;
  let pipDismissed = false;

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function handleReelPlayAttempt() {
    if (!isVideoUnlocked) {
      openLockModal();
      return;
    }
    openCinemaModal('song.mp4', '✨ Daniel Paul & Esther — Wedding Moment Reel', weddingVideo ? weddingVideo.currentTime || 0 : 0);
  }

  if (bigPlayBtn) {
    bigPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleReelPlayAttempt();
    });
  }

  if (openModalReelBtn) openModalReelBtn.addEventListener('click', handleReelPlayAttempt);
  if (fullscreenReelDirectBtn) fullscreenReelDirectBtn.addEventListener('click', handleReelPlayAttempt);

  if (heroPlayReelBtn) {
    heroPlayReelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleReelPlayAttempt();
    });
  }

  if (weddingVideo) {
    weddingVideo.addEventListener('click', () => {
      if (!isVideoUnlocked) {
        openLockModal();
      } else {
        if (weddingVideo.paused || weddingVideo.ended) {
          weddingVideo.play().catch(() => {});
          if (playIcon) playIcon.style.display = 'none';
          if (pauseIcon) pauseIcon.style.display = 'inline';
          if (bigPlayOverlay) bigPlayOverlay.classList.add('hidden');
        } else {
          weddingVideo.pause();
          if (playIcon) playIcon.style.display = 'inline';
          if (pauseIcon) pauseIcon.style.display = 'none';
          if (bigPlayOverlay) bigPlayOverlay.classList.remove('hidden');
        }
      }
    });

    weddingVideo.addEventListener('timeupdate', () => {
      if (!isNaN(weddingVideo.duration) && weddingVideo.duration > 0) {
        const pct = (weddingVideo.currentTime / weddingVideo.duration) * 100;
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(weddingVideo.currentTime);
      }
      drawAmbientBacklight();
      drawPipFrame();
    });

    weddingVideo.addEventListener('loadedmetadata', () => {
      if (durationTimeEl) durationTimeEl.textContent = formatTime(weddingVideo.duration);
      if (ambientCanvas) {
        ambientCanvas.width = 160;
        ambientCanvas.height = 90;
      }
      if (pipCanvas) {
        pipCanvas.width = 320;
        pipCanvas.height = 180;
      }
    });

    weddingVideo.addEventListener('progress', () => {
      if (weddingVideo.buffered.length > 0 && weddingVideo.duration > 0 && progressBuffer) {
        const bufferedEnd = weddingVideo.buffered.end(weddingVideo.buffered.length - 1);
        const bufferPct = (bufferedEnd / weddingVideo.duration) * 100;
        progressBuffer.style.width = `${bufferPct}%`;
      }
    });

    weddingVideo.addEventListener('ended', () => {
      if (playIcon) playIcon.style.display = 'inline';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (bigPlayOverlay) bigPlayOverlay.classList.remove('hidden');
    });
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (!isVideoUnlocked) {
        openLockModal();
      } else {
        if (weddingVideo.paused) {
          weddingVideo.play().catch(() => {});
          if (playIcon) playIcon.style.display = 'none';
          if (pauseIcon) pauseIcon.style.display = 'inline';
          if (bigPlayOverlay) bigPlayOverlay.classList.add('hidden');
        } else {
          weddingVideo.pause();
          if (playIcon) playIcon.style.display = 'inline';
          if (pauseIcon) pauseIcon.style.display = 'none';
          if (bigPlayOverlay) bigPlayOverlay.classList.remove('hidden');
        }
      }
    });
  }

  // Timeline Seeking
  if (timelineContainer && weddingVideo) {
    let isScrubbing = false;

    function scrub(e) {
      if (!isVideoUnlocked) {
        openLockModal();
        return;
      }
      const rect = timelineContainer.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (!isNaN(weddingVideo.duration)) {
        weddingVideo.currentTime = pos * weddingVideo.duration;
        if (progressBar) progressBar.style.width = `${pos * 100}%`;
      }
    }

    timelineContainer.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      scrub(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isScrubbing) scrub(e);
    });

    window.addEventListener('mouseup', () => {
      if (isScrubbing) isScrubbing = false;
    });
  }

  // Volume & Mute
  if (volumeSlider && weddingVideo) {
    volumeSlider.addEventListener('input', (e) => {
      weddingVideo.volume = parseFloat(e.target.value);
      weddingVideo.muted = weddingVideo.volume === 0;
      updateVolumeIcons();
    });
  }

  function updateVolumeIcons() {
    if (!weddingVideo || !volumeHighIcon || !volumeMutedIcon) return;
    if (weddingVideo.muted || weddingVideo.volume === 0) {
      volumeHighIcon.style.display = 'none';
      volumeMutedIcon.style.display = 'inline';
    } else {
      volumeHighIcon.style.display = 'inline';
      volumeMutedIcon.style.display = 'none';
    }
  }

  if (muteBtn && weddingVideo) {
    muteBtn.addEventListener('click', () => {
      weddingVideo.muted = !weddingVideo.muted;
      if (!weddingVideo.muted && weddingVideo.volume === 0) {
        weddingVideo.volume = 0.5;
        if (volumeSlider) volumeSlider.value = 0.5;
      }
      updateVolumeIcons();
    });
  }

  // Playback Speed
  const playbackSpeeds = [1.0, 1.25, 1.5, 0.75];
  let speedIndex = 0;
  if (speedToggleBtn && weddingVideo) {
    speedToggleBtn.addEventListener('click', () => {
      speedIndex = (speedIndex + 1) % playbackSpeeds.length;
      const newSpeed = playbackSpeeds[speedIndex];
      weddingVideo.playbackRate = newSpeed;
      speedToggleBtn.textContent = `${newSpeed}x`;
    });
  }

  // Restart
  if (restartVideoBtn && weddingVideo) {
    restartVideoBtn.addEventListener('click', () => {
      if (!isVideoUnlocked) {
        openLockModal();
        return;
      }
      weddingVideo.currentTime = 0;
      weddingVideo.play().catch(() => {});
      showToast('✨ Replaying Wedding Highlight Reel');
    });
  }

  function drawAmbientBacklight() {
    if (!ambientCtx || !weddingVideo || weddingVideo.paused || weddingVideo.ended) return;
    try {
      ambientCtx.drawImage(weddingVideo, 0, 0, ambientCanvas.width, ambientCanvas.height);
    } catch (e) {}
  }

  function drawPipFrame() {
    if (!pipCtx || !pipCanvas || !pipMiniPlayer || !pipMiniPlayer.classList.contains('active')) return;
    try {
      pipCtx.drawImage(weddingVideo, 0, 0, pipCanvas.width, pipCanvas.height);
    } catch (e) {}
  }

  // Picture-in-Picture on scroll
  const videoTheaterSection = document.getElementById('wedding-reel');
  window.addEventListener('scroll', () => {
    if (!videoTheaterSection || pipDismissed || !pipMiniPlayer || !weddingVideo || !isVideoUnlocked) return;
    const rect = videoTheaterSection.getBoundingClientRect();
    const isOutOfView = rect.bottom < 100 || rect.top > window.innerHeight;

    if (isOutOfView && !weddingVideo.paused && !weddingVideo.ended) {
      pipMiniPlayer.classList.add('active');
    } else {
      pipMiniPlayer.classList.remove('active');
    }
  });

  if (pipCloseBtn && pipMiniPlayer) {
    pipCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      pipDismissed = true;
      pipMiniPlayer.classList.remove('active');
    });
  }

  if (pipBody && videoTheaterSection) {
    pipBody.addEventListener('click', () => {
      videoTheaterSection.scrollIntoView({ behavior: 'smooth' });
    });
  }


  /* --------------------------------------------------------------------------
     5. Video 2: Worship Message Video (YouTube: VERYuDOpNYY — Inline & Cinema)
     -------------------------------------------------------------------------- */
  const YOUTUBE_SERMON_ID = 'VERYuDOpNYY';
  const sermonYoutubeIframe = document.getElementById('sermonYoutubeIframe');
  const sermonBigPlayBtn = document.getElementById('sermonBigPlayBtn');
  const sermonBigPlayOverlay = document.getElementById('sermonBigPlayOverlay');
  const watchSermonFullscreenBtn = document.getElementById('watchSermonFullscreenBtn');

  function playInlineSermonYouTube() {
    if (sermonBigPlayOverlay) sermonBigPlayOverlay.classList.add('hidden');
    if (sermonYoutubeIframe) {
      if (sermonYoutubeIframe.contentWindow) {
        sermonYoutubeIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }
      // Ensure autoplay parameter is active for immediate inline playback
      if (!sermonYoutubeIframe.src.includes('autoplay=1')) {
        const separator = sermonYoutubeIframe.src.includes('?') ? '&' : '?';
        sermonYoutubeIframe.src = `${sermonYoutubeIframe.src}${separator}autoplay=1`;
      }
    }
  }

  if (sermonBigPlayBtn) {
    sermonBigPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playInlineSermonYouTube();
    });
  }

  if (sermonBigPlayOverlay) {
    sermonBigPlayOverlay.addEventListener('click', () => {
      playInlineSermonYouTube();
    });
  }

  if (watchSermonFullscreenBtn) {
    watchSermonFullscreenBtn.addEventListener('click', () => {
      openCinemaModal(YOUTUBE_SERMON_ID, '✝ Worship Message & Preaching — Rev. Charles Sunny', 0);
    });
  }


  /* --------------------------------------------------------------------------
     6. Interactive Actions (Google Calendar, Share, Love Reactions)
     -------------------------------------------------------------------------- */
  function createGoogleCalendarUrl(title, details, location, startTimeISO, endTimeISO) {
    const formatTime = (iso) => iso.replace(/-|:|\.\d+/g, '');
    const dates = `${formatTime(startTimeISO)}/${formatTime(endTimeISO)}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  }

  const matrimonyCalUrl = createGoogleCalendarUrl(
    'Holy Matrimony — Daniel Paul & Esther',
    'Holy Christian Matrimony Service of Daniel Paul & Esther. Solemnized by Rev. Charles Sunny (Addanki).',
    'Church at Eleswaravari Palem, Addanki Mandal, Bapatla District, Andhra Pradesh',
    '20260930T043000Z',
    '20260930T080000Z'
  );

  const receptionCalUrl = createGoogleCalendarUrl(
    'Grand Wedding Reception — Daniel Paul & Esther',
    'Grand Wedding Reception & Dinner of Daniel Paul & Esther.',
    'The Grand Celebration Hall, Addanki, Bapatla District, Andhra Pradesh',
    '20261002T130000Z',
    '20261002T163000Z'
  );

  const addToCalHeroBtn = document.getElementById('addToCalHeroBtn');
  const addMatrimonyCalBtn = document.getElementById('addMatrimonyCalBtn');
  const addReceptionCalBtn = document.getElementById('addReceptionCalBtn');

  if (addToCalHeroBtn) {
    addToCalHeroBtn.addEventListener('click', () => {
      window.open(matrimonyCalUrl, '_blank');
      showToast('📅 Opening Google Calendar for Holy Matrimony');
    });
  }

  if (addMatrimonyCalBtn) {
    addMatrimonyCalBtn.addEventListener('click', () => {
      window.open(matrimonyCalUrl, '_blank');
      showToast('📅 Added Holy Matrimony (Sep 30) to Calendar');
    });
  }

  if (addReceptionCalBtn) {
    addReceptionCalBtn.addEventListener('click', () => {
      window.open(receptionCalUrl, '_blank');
      showToast('📅 Added Grand Reception (Oct 02) to Calendar');
    });
  }

  // Share Invitation
  function shareInvitation() {
    const shareData = {
      title: 'Daniel Paul & Esther — Holy Christian Matrimony',
      text: 'You are cordially invited to celebrate the sacred Christian wedding union of Daniel Paul & Esther on September 30, 2026 at Eleswaravari Palem, Addanki, Bapatla, AP.',
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('🔗 Wedding link copied to clipboard! Share with friends & family.');
      }).catch(() => {
        showToast('🔗 Wedding invitation link ready to share!');
      });
    }
  }

  const shareNavBtn = document.getElementById('shareNavBtn');
  const shareInviteHeroBtn = document.getElementById('shareInviteHeroBtn');

  if (shareNavBtn) shareNavBtn.addEventListener('click', shareInvitation);
  if (shareInviteHeroBtn) shareInviteHeroBtn.addEventListener('click', shareInvitation);

  // Floating Reaction FAB
  const floatingBlessingBtn = document.getElementById('floatingBlessingBtn');
  const quickBlessingBtn = document.getElementById('quickBlessingBtn');

  if (floatingBlessingBtn) {
    floatingBlessingBtn.addEventListener('click', () => {
      triggerCelebration();
      showToast('♥ Sending love & prayers to Daniel Paul & Esther!');
    });
  }

  if (quickBlessingBtn) {
    quickBlessingBtn.addEventListener('click', () => {
      triggerCelebration();
      showToast('♥ Sending warm wedding blessings!');
    });
  }


  /* --------------------------------------------------------------------------
     7. Romantic Petals & Divine Sparkle Canvas
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('particlesCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const numParticles = 35;

    class RomanticParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * -50;
        this.size = Math.random() * 8 + 3;
        this.speedY = Math.random() * 0.6 + 0.3;
        this.speedX = Math.sin(Math.random() * Math.PI) * 0.4 - 0.2;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 1.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.isSparkle = Math.random() > 0.6;
      }

      update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y * 0.01) * 0.5 + this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 20) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;

        if (this.isSparkle) {
          ctx.fillStyle = '#fceec5';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#e5c158';
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(226, 160, 150, 0.6)';
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size * 0.6, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < numParticles; i++) {
      const p = new RomanticParticle();
      p.y = Math.random() * height;
      particles.push(p);
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.update();
        p.draw();
      }
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }


  /* --------------------------------------------------------------------------
     8. Celebratory Confetti & Holy Cross / Heart Canvas
     -------------------------------------------------------------------------- */
  const celebCanvas = document.getElementById('celebrationCanvas');
  let celebCtx = celebCanvas ? celebCanvas.getContext('2d') : null;
  let celebItems = [];

  function triggerCelebration() {
    if (!celebCanvas || !celebCtx) return;
    celebCanvas.width = window.innerWidth;
    celebCanvas.height = window.innerHeight;

    const colors = ['#e5c158', '#fceec5', '#e2a096', '#ffffff', '#ffd700'];
    const totalCount = 70;

    for (let i = 0; i < totalCount; i++) {
      celebItems.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 240,
        y: window.innerHeight * 0.75,
        vx: (Math.random() - 0.5) * 14,
        vy: -(Math.random() * 12 + 6),
        gravity: 0.28,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        symbolType: Math.random() > 0.6 ? 'cross' : (Math.random() > 0.5 ? 'heart' : 'confetti')
      });
    }

    if (celebItems.length === totalCount) {
      animateCelebration();
    }
  }

  function animateCelebration() {
    if (!celebCtx || celebItems.length === 0) return;
    celebCtx.clearRect(0, 0, celebCanvas.width, celebCanvas.height);

    for (let i = celebItems.length - 1; i >= 0; i--) {
      const item = celebItems[i];
      item.x += item.vx;
      item.y += item.vy;
      item.vy += item.gravity;
      item.rotation += item.rotSpeed;
      item.opacity -= 0.009;

      if (item.opacity <= 0 || item.y > celebCanvas.height + 50) {
        celebItems.splice(i, 1);
        continue;
      }

      celebCtx.save();
      celebCtx.translate(item.x, item.y);
      celebCtx.rotate((item.rotation * Math.PI) / 180);
      celebCtx.globalAlpha = Math.max(0, item.opacity);
      celebCtx.fillStyle = item.color;

      if (item.symbolType === 'cross') {
        celebCtx.font = `${Math.floor(item.size * 1.5)}px serif`;
        celebCtx.fillText('✝', 0, 0);
      } else if (item.symbolType === 'heart') {
        celebCtx.font = `${Math.floor(item.size * 1.5)}px serif`;
        celebCtx.fillText('♥', 0, 0);
      } else {
        celebCtx.fillRect(-item.size / 2, -item.size / 2, item.size, item.size * 0.6);
      }

      celebCtx.restore();
    }

    if (celebItems.length > 0) {
      requestAnimationFrame(animateCelebration);
    } else {
      celebCtx.clearRect(0, 0, celebCanvas.width, celebCanvas.height);
    }
  }


  /* --------------------------------------------------------------------------
     9. 3D Card Tilt Effect on Mouse Move
     -------------------------------------------------------------------------- */
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });


  /* --------------------------------------------------------------------------
     10. Scroll Reveal Animations (Intersection Observer)
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));


  /* --------------------------------------------------------------------------
     11. Live Countdown Timer (September 30, 2026)
     -------------------------------------------------------------------------- */
  const countDays = document.getElementById('countDays');
  const countHours = document.getElementById('countHours');
  const countMinutes = document.getElementById('countMinutes');
  const countSeconds = document.getElementById('countSeconds');

  const targetDate = new Date('2026-09-30T10:00:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      if (countDays) countDays.textContent = '00';
      if (countHours) countHours.textContent = '00';
      if (countMinutes) countMinutes.textContent = '00';
      if (countSeconds) countSeconds.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (countDays) countDays.textContent = days < 10 ? `0${days}` : days;
    if (countHours) countHours.textContent = hours < 10 ? `0${hours}` : hours;
    if (countMinutes) countMinutes.textContent = mins < 10 ? `0${mins}` : mins;
    if (countSeconds) countSeconds.textContent = secs < 10 ? `0${secs}` : secs;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);


  /* --------------------------------------------------------------------------
     12. RSVP & Prayer Submission Controller
     -------------------------------------------------------------------------- */
  const rsvpForm = document.getElementById('rsvpForm');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvpName').value.trim();
      const guests = document.getElementById('rsvpGuests').value;
      const events = document.getElementById('rsvpEvents').value;
      const status = document.querySelector('input[name="rsvpStatus"]:checked')?.value || 'Joyfully Attending';

      triggerCelebration();
      showToast(`✝ Thank you, ${name}! Your RSVP & Blessings for ${events} (${guests}) have been received!`);
      rsvpForm.reset();
    });
  }


  /* --------------------------------------------------------------------------
     13. Toast Notification, Scroll Spy & Back to Top Button
     -------------------------------------------------------------------------- */
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(msg) {
    if (!toastNotification) return;
    toastMessage.textContent = msg;
    toastNotification.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 4500);
  }

  const navbar = document.getElementById('navbar');
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    if (scrollToTopBtn) {
      if (window.scrollY > 400) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    }

    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
