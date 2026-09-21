import 'package:flutter/material.dart';

import '../api_client.dart';
import '../main.dart';
import 'otp_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _submit() async {
    final phone = _phoneController.text.trim();
    setState(() {
      _error = null;
    });
    if (!RegExp(r'^\d{10,15}$').hasMatch(phone)) {
      setState(() => _error = 'Enter a valid phone number.');
      return;
    }
    setState(() => _loading = true);
    final res = await ApiClient.instance.requestOtp(phone);
    setState(() => _loading = false);
    if (!res.ok) {
      setState(() => _error = res.error ?? 'Could not send the code.');
      return;
    }
    if (!mounted) return;
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => OtpScreen(phone: phone)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Flex Fitness',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: kInk, fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Member Login',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: kMuted, fontSize: 14),
                ),
                const SizedBox(height: 32),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  style: const TextStyle(color: kInk),
                  decoration: const InputDecoration(labelText: 'Phone number', labelStyle: TextStyle(color: kMuted)),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
                ],
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  child: Text(_loading ? 'Sending…' : 'Send code'),
                ),
                const SizedBox(height: 12),
                const Text(
                  "We'll send a login code to this number on WhatsApp.",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: kMuted, fontSize: 12),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
