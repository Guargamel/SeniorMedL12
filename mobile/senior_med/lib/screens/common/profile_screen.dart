import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';

import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../services/tts_service.dart';
import '../../models/user_model.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _auth = AuthService();
  UserModel? user;
  String? error;
  bool loading = true;
  bool saving = false;

  // Edit controllers
  late TextEditingController _nameCtrl;
  late TextEditingController _emailCtrl;
  late TextEditingController _curPassCtrl;
  late TextEditingController _newPassCtrl;
  late TextEditingController _confirmPassCtrl;

  XFile? _avatarFile;
  String? _avatarPreviewPath;

  String? _successMsg;

  @override
  void initState() {
    super.initState();
    _nameCtrl    = TextEditingController();
    _emailCtrl   = TextEditingController();
    _curPassCtrl = TextEditingController();
    _newPassCtrl = TextEditingController();
    _confirmPassCtrl = TextEditingController();
    _load();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _curPassCtrl.dispose();
    _newPassCtrl.dispose();
    _confirmPassCtrl.dispose();
    TtsService.instance.stop();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() { loading = true; error = null; });
    try {
      final me = await _auth.me();
      setState(() {
        user = me;
        _nameCtrl.text  = me.name;
        _emailCtrl.text = me.email;
      });
    } catch (e) {
      setState(() => error = e.toString());
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> _pickAvatar() async {
    try {
      final picker = ImagePicker();
      final img = await picker.pickImage(source: ImageSource.gallery, maxWidth: 800, imageQuality: 80);
      if (img != null) {
        setState(() {
          _avatarFile = img;
          _avatarPreviewPath = img.path;
        });
        TtsService.instance.speakTagalog("Napili ang bagong litrato ng profile.");
      }
    } catch (e) {
      setState(() => error = "Hindi ma-upload ang litrato: $e");
    }
  }

  Future<void> _saveProfile() async {
    if (saving) return;
    setState(() { saving = true; error = null; _successMsg = null; });

    try {
      final formData = FormData.fromMap({
        'name':  _nameCtrl.text.trim(),
        'email': _emailCtrl.text.trim(),
        // No '_method': 'PUT' — API route accepts POST directly for multipart.
        // _method spoofing only works for HTML web forms, not Dio multipart.
        if (_avatarFile != null)
          'avatar': await MultipartFile.fromFile(_avatarFile!.path, filename: _avatarFile!.name),
      });

      final res = await ApiService.instance.dio.post(
        '/profile',
        data: formData,
        // Do NOT set contentType manually — Dio sets multipart boundary automatically
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        // Update user state immediately from the response (no extra reload needed)
        final rawUser = res.data['user'] ?? res.data;
        if (rawUser is Map<String, dynamic>) {
          final updated = UserModel.fromJson(rawUser);
          setState(() {
            user              = updated;
            _avatarFile       = null;
            _avatarPreviewPath = null; // clear local preview; network fetch takes over
            _successMsg       = 'Profile updated! / Na-update ang profile!';
          });
        } else {
          setState(() {
            _avatarFile       = null;
            _avatarPreviewPath = null;
            _successMsg       = 'Profile updated successfully!';
          });
        }
        TtsService.instance.speakTagalog("Matagumpay na na-update ang inyong profile.");
      } else {
        throw Exception('${res.statusCode}: ${res.data}');
      }
    } catch (e) {
      setState(() => error = e.toString());
      TtsService.instance.speakTagalog("May nagkamali sa pag-update ng profile.");
    } finally {
      setState(() => saving = false);
    }
  }

  Future<void> _changePassword() async {
    final cur     = _curPassCtrl.text.trim();
    final newPass = _newPassCtrl.text.trim();
    final confirm = _confirmPassCtrl.text.trim();

    if (cur.isEmpty || newPass.isEmpty || confirm.isEmpty) {
      setState(() => error = "Punan ang lahat ng password fields.");
      TtsService.instance.speakTagalog("Punan ang lahat ng password fields.");
      return;
    }

    if (newPass != confirm) {
      setState(() => error = "Ang bagong password ay hindi magkatugma.");
      TtsService.instance.speakTagalog("Hindi magkatugma ang mga password. Subukan ulit.");
      return;
    }

    if (saving) return;
    setState(() { saving = true; error = null; _successMsg = null; });

    try {
      final res = await ApiService.instance.dio.put(
        '/profile/password',
        data: {
          'current_password':      cur,
          'password':              newPass,
          'password_confirmation': confirm,
        },
      );

      if (res.statusCode == 200) {
        _curPassCtrl.clear();
        _newPassCtrl.clear();
        _confirmPassCtrl.clear();
        setState(() => _successMsg = 'Password updated successfully!');
        TtsService.instance.speakTagalog("Matagumpay na nabago ang inyong password.");
      } else {
        final msg = res.data?['message'] ?? res.data.toString();
        throw Exception(msg);
      }
    } catch (e) {
      setState(() => error = e.toString());
      TtsService.instance.speakTagalog("May nagkamali sa pagbabago ng password.");
    } finally {
      setState(() => saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final u = user;
    return Scaffold(
      appBar: AppBar(
        title: const Text("Aking Profile"),
        actions: [
          IconButton(
            icon: const Icon(Icons.volume_up),
            tooltip: "Pakinggan",
            onPressed: () => TtsService.instance.speakTagalog(
              "Profile screen. Maaari ninyong baguhin ang inyong pangalan, email, password, at litrato.",
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: "Mag-logout",
            onPressed: () async {
              await _auth.logout();
              if (context.mounted) context.go("/login");
            },
          ),
        ],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null && u == null
              ? Center(child: Text(error!, style: const TextStyle(color: Colors.red, fontSize: 16)))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Success/Error banners
                      if (_successMsg != null)
                        Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.green.shade300)),
                          child: Row(children: [
                            const Icon(Icons.check_circle, color: Colors.green),
                            const SizedBox(width: 8),
                            Expanded(child: Text(_successMsg!, style: const TextStyle(color: Colors.green, fontSize: 16))),
                          ]),
                        ),
                      if (error != null)
                        Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.red.shade300)),
                          child: Row(children: [
                            const Icon(Icons.error_outline, color: Colors.red),
                            const SizedBox(width: 8),
                            Expanded(child: Text(error!, style: const TextStyle(color: Colors.red, fontSize: 16))),
                          ]),
                        ),

                      // ─── Avatar ───────────────────────────────────────
                      Center(
                        child: Stack(
                          children: [
                            GestureDetector(
                              onTap: _pickAvatar,
                              child: CircleAvatar(
                                radius: 56,
                                backgroundColor: Colors.green.shade200,
                                // Show local preview if user just picked a new image
                                backgroundImage: _avatarPreviewPath != null
                                    ? FileImage(File(_avatarPreviewPath!)) as ImageProvider
                                    : null,
                                child: _avatarPreviewPath == null
                                    ? _AvatarNetworkImage(
                                        avatarUrl: u?.avatarUrl,
                                        name: u?.name ?? '?',
                                      )
                                    : null,
                              ),
                            ),
                            Positioned(
                              bottom: 0, right: 0,
                              child: GestureDetector(
                                onTap: _pickAvatar,
                                child: Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle),
                                  child: const Icon(Icons.camera_alt, color: Colors.white, size: 20),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Center(
                        child: TextButton.icon(
                          onPressed: _pickAvatar,
                          icon: const Icon(Icons.edit, size: 18),
                          label: const Text("Baguhin ang Litrato", style: TextStyle(fontSize: 16)),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // ─── Profile Info Section ─────────────────────────
                      _sectionHeader("Impormasyon ng Account", Icons.person),
                      const SizedBox(height: 10),
                      _labeledField("Buong Pangalan / Full Name", _nameCtrl, TextInputType.name),
                      const SizedBox(height: 12),
                      _labeledField("Email Address", _emailCtrl, TextInputType.emailAddress),
                      const SizedBox(height: 16),

                      // Roles chips
                      if (u?.roles.isNotEmpty == true) ...[
                        Wrap(
                          spacing: 8,
                          children: u!.roles.map((r) => Chip(
                            label: Text(r, style: const TextStyle(fontSize: 15)),
                            backgroundColor: Colors.green.shade100,
                          )).toList(),
                        ),
                        const SizedBox(height: 16),
                      ],

                      SizedBox(
                        height: 54,
                        child: ElevatedButton.icon(
                          onPressed: saving ? null : _saveProfile,
                          icon: saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.save),
                          label: Text(saving ? "Sine-save..." : "I-save ang mga Pagbabago", style: const TextStyle(fontSize: 18)),
                        ),
                      ),
                      const SizedBox(height: 28),

                      // ─── Change Password Section ───────────────────────
                      _sectionHeader("Baguhin ang Password", Icons.lock),
                      const SizedBox(height: 10),
                      _labeledField("Kasalukuyang Password / Current Password", _curPassCtrl, TextInputType.visiblePassword, obscure: true),
                      const SizedBox(height: 12),
                      _labeledField("Bagong Password / New Password", _newPassCtrl, TextInputType.visiblePassword, obscure: true),
                      const SizedBox(height: 12),
                      _labeledField("Kumpirmahin ang Bagong Password", _confirmPassCtrl, TextInputType.visiblePassword, obscure: true),
                      const SizedBox(height: 16),

                      SizedBox(
                        height: 54,
                        child: ElevatedButton.icon(
                          onPressed: saving ? null : _changePassword,
                          icon: const Icon(Icons.lock_reset),
                          label: const Text("Baguhin ang Password", style: TextStyle(fontSize: 18)),
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                        ),
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
    );
  }

  Widget _sectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: Colors.green, size: 26),
        const SizedBox(width: 8),
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(width: 8),
        const Expanded(child: Divider()),
      ],
    );
  }

  Widget _labeledField(String label, TextEditingController ctrl, TextInputType type, {bool obscure = false}) {
    return TextField(
      controller: ctrl,
      keyboardType: type,
      obscureText: obscure,
      style: const TextStyle(fontSize: 17),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(fontSize: 15),
        border: const OutlineInputBorder(),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// Helper: loads the avatar from Laravel storage with the Bearer token attached.
//
// Why: Flutter's NetworkImage doesn't support custom headers, so a normal
// NetworkImage(avatarUrl) on a non-public storage path would get a 401/403.
// Even on a public disk the URL may be relative (e.g. "/storage/avatars/x.jpg")
// which also fails on mobile. This widget uses Dio to fetch the bytes, then
// displays them — giving us auth headers + absolute URL resolution for free.
// ─────────────────────────────────────────────────────────────────────────────
class _AvatarNetworkImage extends StatefulWidget {
  final String? avatarUrl;
  final String name;

  const _AvatarNetworkImage({required this.avatarUrl, required this.name});

  @override
  State<_AvatarNetworkImage> createState() => _AvatarNetworkImageState();
}

class _AvatarNetworkImageState extends State<_AvatarNetworkImage> {
  Uint8List? _bytes;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    if (widget.avatarUrl != null && widget.avatarUrl!.isNotEmpty) {
      _fetch(widget.avatarUrl!);
    }
  }

  @override
  void didUpdateWidget(_AvatarNetworkImage old) {
    super.didUpdateWidget(old);
    if (old.avatarUrl != widget.avatarUrl && widget.avatarUrl != null) {
      _fetch(widget.avatarUrl!);
    }
  }

  Future<void> _fetch(String rawUrl) async {
    if (_loading) return;
    setState(() { _loading = true; _bytes = null; });
    try {
      // Make the URL absolute: if it starts with http use as-is,
      // otherwise prepend the server base URL.
      // Storage URLs (/storage/...) are served from the server ROOT,
      // not from /api. Strip any /api suffix from the base URL.
      final String baseOrigin = ApiService.instance.currentBaseUrl
          .replaceAll(RegExp(r'/api/?$'), '');
      final String url = rawUrl.startsWith('http')
          ? rawUrl
          : '$baseOrigin$rawUrl';

      final token = await ApiService.instance.getToken();
      final res = await ApiService.instance.dio.get<List<int>>(
        url,
        options: Options(
          responseType: ResponseType.bytes,
          headers: token != null ? {'Authorization': 'Bearer $token'} : {},
          // Don't throw on 4xx so we can fall back gracefully
          validateStatus: (s) => s != null && s < 500,
        ),
      );
      if (res.statusCode == 200 && res.data != null) {
        if (mounted) setState(() => _bytes = Uint8List.fromList(res.data!));
      }
    } catch (_) {
      // Fall through to initials fallback
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const SizedBox(
        width: 36, height: 36,
        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
      );
    }
    if (_bytes != null) {
      return ClipOval(
        child: Image.memory(_bytes!, width: 112, height: 112, fit: BoxFit.cover),
      );
    }
    // Fallback: show initials
    final initial = widget.name.isNotEmpty ? widget.name[0].toUpperCase() : '?';
    return Text(
      initial,
      style: const TextStyle(fontSize: 40, color: Colors.white, fontWeight: FontWeight.bold),
    );
  }
}
