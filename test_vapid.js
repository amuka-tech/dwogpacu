import webpush from 'web-push';
try {
  webpush.setVapidDetails(
    "mailto:admin@dwogpacu.com",
    "BOl_ede4LbXQpsED0dXQp23ehRtecYLTz2I9QI9PpLVGgRqcQjmdYslWoe2R4YMfKJhs8Xm3oTHdyGKjd9Znme4",
    "O3ozg0yGdukOzp0zLje6u8SNadoGfe9-gjKt7YB1YV0"
  );
  console.log("VAPID keys match!");
} catch (e) {
  console.error("VAPID keys DO NOT MATCH!", e);
}
