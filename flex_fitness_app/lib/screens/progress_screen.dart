import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import '../api_client.dart';
import '../main.dart';

const _measurementFields = [
  ['weight_kg', 'Weight', 'kg'],
  ['body_fat_percentage', 'Body fat', '%'],
  ['waist_cm', 'Waist', 'cm'],
  ['chest_cm', 'Chest', 'cm'],
  ['arms_cm', 'Arms', 'cm'],
  ['thighs_cm', 'Thighs', 'cm'],
  ['hips_cm', 'Hips', 'cm'],
  ['neck_cm', 'Neck', 'cm'],
];

class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key});

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen> {
  List<Map<String, dynamic>> _logs = [];
  List<Map<String, dynamic>> _photos = [];
  bool _loading = true;

  final Map<String, TextEditingController> _controllers = {
    for (final f in _measurementFields) f[0]: TextEditingController(),
  };
  final _notesController = TextEditingController();
  bool _saving = false;
  String? _error;

  File? _pickedPhoto;
  String _viewType = 'front';
  bool _isMilestone = false;
  bool _uploading = false;
  String? _photoError;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await ApiClient.instance.getProgress();
    setState(() {
      _logs = res.ok ? (res.data['logs'] as List).cast<Map<String, dynamic>>() : [];
      _photos = res.ok ? (res.data['photos'] as List).cast<Map<String, dynamic>>() : [];
      _loading = false;
    });
  }

  Future<void> _saveMeasurement() async {
    setState(() {
      _error = null;
      _saving = true;
    });
    final body = <String, dynamic>{};
    for (final f in _measurementFields) {
      final text = _controllers[f[0]]!.text.trim();
      if (text.isNotEmpty) body[f[0]] = double.tryParse(text);
    }
    if (_notesController.text.trim().isNotEmpty) body['notes'] = _notesController.text.trim();

    final res = await ApiClient.instance.saveMeasurement(body);
    setState(() => _saving = false);
    if (!res.ok) {
      setState(() => _error = res.error ?? 'Could not save.');
      return;
    }
    for (final c in _controllers.values) {
      c.clear();
    }
    _notesController.clear();
    _load();
  }

  Future<void> _pickPhoto() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked != null) setState(() => _pickedPhoto = File(picked.path));
  }

  Future<void> _uploadPhoto() async {
    setState(() => _photoError = null);
    if (_pickedPhoto == null) {
      setState(() => _photoError = 'Choose a photo first.');
      return;
    }
    setState(() => _uploading = true);
    final res = await ApiClient.instance.uploadPhoto(
      _pickedPhoto!,
      viewType: _viewType,
      date: DateFormat('yyyy-MM-dd').format(DateTime.now()),
      isMilestone: _isMilestone,
    );
    setState(() => _uploading = false);
    if (!res.ok) {
      setState(() => _photoError = res.error ?? 'Could not upload.');
      return;
    }
    setState(() {
      _pickedPhoto = null;
      _isMilestone = false;
    });
    _load();
  }

  String _fmtDate(String d) => DateFormat('d MMM yyyy').format(DateTime.parse('${d}T12:00:00Z'));

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My Progress'),
          bottom: const TabBar(
            indicatorColor: kGold,
            labelColor: kGold,
            unselectedLabelColor: kMuted,
            tabs: [Tab(text: 'Measurements'), Tab(text: 'Photos')],
          ),
        ),
        body: _loading
            ? const Center(child: CircularProgressIndicator(color: kGold))
            : TabBarView(
                children: [_buildMeasurementsTab(), _buildPhotosTab()],
              ),
      ),
    );
  }

  Widget _buildMeasurementsTab() {
    return RefreshIndicator(
      onRefresh: _load,
      color: kGold,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _card(
            title: "Log today's numbers",
            child: Column(
              children: [
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  childAspectRatio: 2.8,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                  children: _measurementFields.map((f) {
                    return TextField(
                      controller: _controllers[f[0]],
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      style: const TextStyle(color: kInk, fontSize: 13),
                      decoration: InputDecoration(labelText: '${f[1]} (${f[2]})', labelStyle: const TextStyle(color: kMuted, fontSize: 11)),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _notesController,
                  style: const TextStyle(color: kInk),
                  maxLines: 2,
                  decoration: const InputDecoration(labelText: 'Notes (optional)', labelStyle: TextStyle(color: kMuted)),
                ),
                if (_error != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 12))),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(onPressed: _saving ? null : _saveMeasurement, child: Text(_saving ? 'Saving…' : 'Save entry')),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          _card(
            title: 'History',
            child: _logs.isEmpty
                ? const Text('No entries yet.', style: TextStyle(color: kMuted))
                : Column(
                    children: _logs.map((log) {
                      final parts = <String>[];
                      for (final f in _measurementFields) {
                        if (log[f[0]] != null) parts.add('${f[1]}: ${log[f[0]]}${f[2]}');
                      }
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: kPaper, borderRadius: BorderRadius.circular(10), border: Border.all(color: kLine)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_fmtDate(log['log_date']), style: const TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Wrap(spacing: 12, children: parts.map((p) => Text(p, style: const TextStyle(color: kInk, fontSize: 13))).toList()),
                            if (log['notes'] != null) Padding(padding: const EdgeInsets.only(top: 6), child: Text(log['notes'], style: const TextStyle(color: kMuted, fontSize: 12))),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildPhotosTab() {
    return RefreshIndicator(
      onRefresh: _load,
      color: kGold,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _card(
            title: 'Upload a photo',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_pickedPhoto != null)
                  ClipRRect(borderRadius: BorderRadius.circular(10), child: Image.file(_pickedPhoto!, height: 140, width: double.infinity, fit: BoxFit.cover)),
                const SizedBox(height: 8),
                OutlinedButton(onPressed: _pickPhoto, child: Text(_pickedPhoto == null ? 'Choose photo' : 'Change photo')),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: _viewType,
                        dropdownColor: kPanel,
                        style: const TextStyle(color: kInk),
                        items: const ['front', 'side', 'back', 'other']
                            .map((v) => DropdownMenuItem(value: v, child: Text(v[0].toUpperCase() + v.substring(1))))
                            .toList(),
                        onChanged: (v) => setState(() => _viewType = v!),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Row(
                      children: [
                        Checkbox(value: _isMilestone, activeColor: kGold, onChanged: (v) => setState(() => _isMilestone = v ?? false)),
                        const Text('Milestone', style: TextStyle(color: kInk, fontSize: 13)),
                      ],
                    ),
                  ],
                ),
                if (_photoError != null) Padding(padding: const EdgeInsets.only(top: 4), child: Text(_photoError!, style: const TextStyle(color: Colors.redAccent, fontSize: 12))),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(onPressed: _uploading ? null : _uploadPhoto, child: Text(_uploading ? 'Uploading…' : 'Upload')),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          _card(
            title: 'History',
            child: _photos.isEmpty
                ? const Text('No photos yet.', style: TextStyle(color: kMuted))
                : GridView.count(
                    crossAxisCount: 3,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                    children: _photos.map((p) {
                      return Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(p['url'], fit: BoxFit.cover, width: double.infinity, height: double.infinity),
                          ),
                          if (p['is_milestone'] == true)
                            Positioned(
                              top: 4,
                              right: 4,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(color: kGold, borderRadius: BorderRadius.circular(20)),
                                child: const Text('★', style: TextStyle(color: kPaper, fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                            ),
                        ],
                      );
                    }).toList(),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _card({required String title, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: kPanel, borderRadius: BorderRadius.circular(16), border: Border.all(color: kLine)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title.toUpperCase(), style: const TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}
