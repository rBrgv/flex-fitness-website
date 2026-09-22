import 'package:flutter/material.dart';

import '../api_client.dart';
import '../main.dart';

const _goalTypes = ['strength', 'hypertrophy', 'fat_loss', 'general'];

class WorkoutPlanEditorScreen extends StatefulWidget {
  final String? planId;
  const WorkoutPlanEditorScreen({super.key, this.planId});

  @override
  State<WorkoutPlanEditorScreen> createState() => _WorkoutPlanEditorScreenState();
}

class _Row {
  final dayLabel = TextEditingController();
  final name = TextEditingController();
  final sets = TextEditingController();
  final reps = TextEditingController();
  final restSeconds = TextEditingController();
  _Row({String dayLabel = 'Day 1'}) {
    this.dayLabel.text = dayLabel;
  }
}

class _WorkoutPlanEditorScreenState extends State<WorkoutPlanEditorScreen> {
  final _titleController = TextEditingController();
  final _notesController = TextEditingController();
  String? _goalType;
  final List<_Row> _rows = [_Row()];
  bool _loading = false;
  bool _saving = false;
  bool _deleting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.planId != null) _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await ApiClient.instance.getWorkoutPlanDetail(widget.planId!);
    if (res.ok) {
      final plan = res.data['plan'] as Map<String, dynamic>;
      final exercises = (res.data['exercises'] as List).cast<Map<String, dynamic>>();
      _titleController.text = plan['title'];
      _goalType = plan['goal_type'];
      _notesController.text = plan['notes'] ?? '';
      _rows.clear();
      for (final ex in exercises) {
        final r = _Row(dayLabel: ex['day_label']);
        r.name.text = ex['name'];
        r.sets.text = ex['sets']?.toString() ?? '';
        r.reps.text = ex['reps'] ?? '';
        r.restSeconds.text = ex['rest_seconds']?.toString() ?? '';
        _rows.add(r);
      }
      if (_rows.isEmpty) _rows.add(_Row());
    }
    setState(() => _loading = false);
  }

  Future<void> _save() async {
    setState(() => _error = null);
    if (_titleController.text.trim().isEmpty) return setState(() => _error = 'Title is required.');
    final exercises = _rows
        .where((r) => r.name.text.trim().isNotEmpty && r.dayLabel.text.trim().isNotEmpty)
        .map((r) => {
              'day_label': r.dayLabel.text.trim(),
              'name': r.name.text.trim(),
              'sets': r.sets.text.isEmpty ? null : int.tryParse(r.sets.text),
              'reps': r.reps.text.trim().isEmpty ? null : r.reps.text.trim(),
              'rest_seconds': r.restSeconds.text.isEmpty ? null : int.tryParse(r.restSeconds.text),
            })
        .toList();
    if (exercises.isEmpty) return setState(() => _error = 'At least one exercise is required.');

    setState(() => _saving = true);
    final body = {
      'title': _titleController.text.trim(),
      'goal_type': _goalType,
      'notes': _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
      'exercises': exercises,
    };
    final res = widget.planId == null
        ? await ApiClient.instance.createWorkoutPlan(body)
        : await ApiClient.instance.updateWorkoutPlan(widget.planId!, body);
    setState(() => _saving = false);
    if (!res.ok) return setState(() => _error = res.error ?? 'Could not save.');
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  Future<void> _delete() async {
    if (widget.planId == null) return;
    setState(() => _deleting = true);
    final res = await ApiClient.instance.deleteWorkoutPlan(widget.planId!);
    setState(() => _deleting = false);
    if (!res.ok) return setState(() => _error = res.error ?? 'Could not delete.');
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.planId == null ? 'New Workout Plan' : 'Edit Workout Plan')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kGold))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                TextField(controller: _titleController, style: const TextStyle(color: kInk), decoration: const InputDecoration(labelText: 'Title', labelStyle: TextStyle(color: kMuted))),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _goalType,
                  dropdownColor: kPanel,
                  style: const TextStyle(color: kInk),
                  decoration: const InputDecoration(labelText: 'Goal', labelStyle: TextStyle(color: kMuted)),
                  items: [const DropdownMenuItem(value: null, child: Text('— none —')), ..._goalTypes.map((g) => DropdownMenuItem(value: g, child: Text(g)))],
                  onChanged: (v) => setState(() => _goalType = v),
                ),
                const SizedBox(height: 12),
                TextField(controller: _notesController, maxLines: 2, style: const TextStyle(color: kInk), decoration: const InputDecoration(labelText: 'Notes', labelStyle: TextStyle(color: kMuted))),
                const SizedBox(height: 20),
                const Text('EXERCISES', style: TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                const SizedBox(height: 8),
                ..._rows.asMap().entries.map((entry) {
                  final i = entry.key;
                  final row = entry.value;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: kPanel, borderRadius: BorderRadius.circular(12), border: Border.all(color: kLine)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(child: TextField(controller: row.dayLabel, style: const TextStyle(color: kInk, fontSize: 13), decoration: const InputDecoration(labelText: 'Day label', labelStyle: TextStyle(color: kMuted, fontSize: 11)))),
                            if (_rows.length > 1)
                              IconButton(icon: const Icon(Icons.close, size: 18, color: kMuted), onPressed: () => setState(() => _rows.removeAt(i))),
                          ],
                        ),
                        TextField(controller: row.name, style: const TextStyle(color: kInk), decoration: const InputDecoration(labelText: 'Exercise name', labelStyle: TextStyle(color: kMuted))),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Expanded(child: TextField(controller: row.sets, keyboardType: TextInputType.number, style: const TextStyle(color: kInk, fontSize: 12), decoration: const InputDecoration(labelText: 'sets', labelStyle: TextStyle(color: kMuted, fontSize: 11)))),
                            const SizedBox(width: 6),
                            Expanded(flex: 2, child: TextField(controller: row.reps, style: const TextStyle(color: kInk, fontSize: 12), decoration: const InputDecoration(labelText: 'reps (e.g. 8-12)', labelStyle: TextStyle(color: kMuted, fontSize: 11)))),
                            const SizedBox(width: 6),
                            Expanded(child: TextField(controller: row.restSeconds, keyboardType: TextInputType.number, style: const TextStyle(color: kInk, fontSize: 12), decoration: const InputDecoration(labelText: 'rest (s)', labelStyle: TextStyle(color: kMuted, fontSize: 11)))),
                          ],
                        ),
                      ],
                    ),
                  );
                }),
                TextButton(
                  onPressed: () => setState(() => _rows.add(_Row(dayLabel: _rows.isNotEmpty ? _rows.last.dayLabel.text : 'Day 1'))),
                  child: const Text('+ Add exercise', style: TextStyle(color: kGold)),
                ),
                if (_error != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 12))),
                const SizedBox(height: 12),
                ElevatedButton(onPressed: _saving ? null : _save, child: Text(_saving ? 'Saving…' : 'Save template')),
                if (widget.planId != null) ...[
                  const SizedBox(height: 8),
                  TextButton(onPressed: _deleting ? null : _delete, child: Text(_deleting ? 'Deleting…' : 'Delete template', style: const TextStyle(color: kMuted))),
                ],
              ],
            ),
    );
  }
}
