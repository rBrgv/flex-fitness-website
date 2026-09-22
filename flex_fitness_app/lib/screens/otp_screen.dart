import 'package:flutter/material.dart';

import '../api_client.dart';
import '../main.dart';
import 'home_screen.dart';
import 'trainer_home_screen.dart';

class OtpScreen extends StatefulWidget {
  final String phone;
  final bool isTrainer;
  const OtpScreen({super.key, required this.phone, this.isTrainer = false});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _codeController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _submit() async {
    final code = _codeController.text.trim();
    setState(() => _error = null);
    if (!RegExp(r'^\d{6}$').hasMatch(code)) {
      setState(() => _error = 'Enter the 6-digit code.');
      return;
    }
    setState(() => _loading = true);
    final res = widget.isTrainer
        ? await ApiClient.instance.verifyTrainerOtp(widget.phone, code)
        : await ApiClient.instance.verifyOtp(widget.phone, code);
    setState(() => _loading = false);
    if (!res.ok) {
      setState(() => _error = res.error ?? 'Incorrect or expired code.');
      return;
    }
    await ApiClient.instance.saveLoginMode(widget.isTrainer ? 'trainer' : 'member');
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => widget.isTrainer ? const TrainerHomeScreen() : const HomeScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Enter code')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Code sent to ${widget.phone} on WhatsApp', style: const TextStyle(color: kMuted, fontSize: 13)),
            const SizedBox(height: 20),
            TextField(
              controller: _codeController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              style: const TextStyle(color: kInk, fontSize: 20, letterSpacing: 6),
              textAlign: TextAlign.center,
              decoration: const InputDecoration(labelText: 'Code', labelStyle: TextStyle(color: kMuted)),
            ),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
            ],
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: Text(_loading ? 'Verifying…' : 'Verify'),
            ),
          ],
        ),
      ),
    );
  }
}
