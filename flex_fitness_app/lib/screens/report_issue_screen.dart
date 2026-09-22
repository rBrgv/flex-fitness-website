import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../api_client.dart';
import '../main.dart';

class ReportIssueScreen extends StatefulWidget {
  const ReportIssueScreen({super.key});

  @override
  State<ReportIssueScreen> createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends State<ReportIssueScreen> {
  final _descController = TextEditingController();
  bool _urgent = false;
  File? _photo;
  bool _saving = false;
  bool _done = false;
  String? _error;

  Future<void> _pickPhoto() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked != null) setState(() => _photo = File(picked.path));
  }

  Future<void> _submit() async {
    setState(() {
      _error = null;
      _saving = true;
    });
    final res = await ApiClient.instance.submitFacilityReport(
      description: _descController.text.trim().isEmpty ? null : _descController.text.trim(),
      urgent: _urgent,
      photo: _photo,
    );
    setState(() => _saving = false);
    if (!res.ok) {
      setState(() => _error = res.error ?? 'Could not submit the report.');
      return;
    }
    setState(() => _done = true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Report a Facility Issue')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: _done
            ? const Center(child: Text("Thanks for flagging that — the team's on it.", style: TextStyle(color: kMuted), textAlign: TextAlign.center))
            : Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: _descController,
                    maxLines: 3,
                    style: const TextStyle(color: kInk),
                    decoration: const InputDecoration(labelText: 'Describe the issue', labelStyle: TextStyle(color: kMuted)),
                  ),
                  const SizedBox(height: 12),
                  if (_photo != null)
                    ClipRRect(borderRadius: BorderRadius.circular(10), child: Image.file(_photo!, height: 140, fit: BoxFit.cover)),
                  const SizedBox(height: 8),
                  OutlinedButton(onPressed: _pickPhoto, child: Text(_photo == null ? 'Add a photo (optional)' : 'Change photo')),
                  Row(
                    children: [
                      Checkbox(value: _urgent, activeColor: kGold, onChanged: (v) => setState(() => _urgent = v ?? false)),
                      const Text('This is urgent', style: TextStyle(color: kInk)),
                    ],
                  ),
                  if (_error != null) Padding(padding: const EdgeInsets.only(bottom: 8), child: Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 13))),
                  ElevatedButton(
                    onPressed: _saving ? null : _submit,
                    child: Text(_saving ? 'Submitting…' : 'Submit report'),
                  ),
                ],
              ),
      ),
    );
  }
}
