import 'package:flutter/material.dart';

import '../api_client.dart';
import '../main.dart';

const _mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
const _goalTypes = ['fat_loss', 'muscle_gain', 'maintenance', 'recomposition', 'general'];

class MealPlanEditorScreen extends StatefulWidget {
  final String? planId;
  const MealPlanEditorScreen({super.key, this.planId});

  @override
  State<MealPlanEditorScreen> createState() => _MealPlanEditorScreenState();
}

class _Row {
  String mealType;
  final name = TextEditingController();
  final calories = TextEditingController();
  final protein = TextEditingController();
  final carbs = TextEditingController();
  final fats = TextEditingController();
  _Row({this.mealType = 'breakfast'});
}

class _MealPlanEditorScreenState extends State<MealPlanEditorScreen> {
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
    final res = await ApiClient.instance.getMealPlanDetail(widget.planId!);
    if (res.ok) {
      final plan = res.data['plan'] as Map<String, dynamic>;
      final items = (res.data['items'] as List).cast<Map<String, dynamic>>();
      _titleController.text = plan['title'];
      _goalType = plan['goal_type'];
      _notesController.text = plan['notes'] ?? '';
      _rows.clear();
      for (final item in items) {
        final r = _Row(mealType: item['meal_type']);
        r.name.text = item['name'];
        r.calories.text = item['calories']?.toString() ?? '';
        r.protein.text = item['protein_g']?.toString() ?? '';
        r.carbs.text = item['carbs_g']?.toString() ?? '';
        r.fats.text = item['fats_g']?.toString() ?? '';
        _rows.add(r);
      }
      if (_rows.isEmpty) _rows.add(_Row());
    }
    setState(() => _loading = false);
  }

  Future<void> _save() async {
    setState(() => _error = null);
    if (_titleController.text.trim().isEmpty) return setState(() => _error = 'Title is required.');
    final items = _rows
        .where((r) => r.name.text.trim().isNotEmpty)
        .map((r) => {
              'meal_type': r.mealType,
              'name': r.name.text.trim(),
              'calories': r.calories.text.isEmpty ? null : num.tryParse(r.calories.text),
              'protein_g': r.protein.text.isEmpty ? null : num.tryParse(r.protein.text),
              'carbs_g': r.carbs.text.isEmpty ? null : num.tryParse(r.carbs.text),
              'fats_g': r.fats.text.isEmpty ? null : num.tryParse(r.fats.text),
            })
        .toList();
    if (items.isEmpty) return setState(() => _error = 'At least one meal item is required.');

    setState(() => _saving = true);
    final body = {
      'title': _titleController.text.trim(),
      'goal_type': _goalType,
      'notes': _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
      'items': items,
    };
    final res = widget.planId == null
        ? await ApiClient.instance.createMealPlan(body)
        : await ApiClient.instance.updateMealPlan(widget.planId!, body);
    setState(() => _saving = false);
    if (!res.ok) return setState(() => _error = res.error ?? 'Could not save.');
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  Future<void> _delete() async {
    if (widget.planId == null) return;
    setState(() => _deleting = true);
    final res = await ApiClient.instance.deleteMealPlan(widget.planId!);
    setState(() => _deleting = false);
    if (!res.ok) return setState(() => _error = res.error ?? 'Could not delete.');
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.planId == null ? 'New Meal Plan' : 'Edit Meal Plan')),
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
                const Text('MEALS', style: TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
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
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                initialValue: row.mealType,
                                dropdownColor: kPanel,
                                style: const TextStyle(color: kInk, fontSize: 13),
                                items: _mealTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                                onChanged: (v) => setState(() => row.mealType = v!),
                              ),
                            ),
                            if (_rows.length > 1)
                              IconButton(icon: const Icon(Icons.close, size: 18, color: kMuted), onPressed: () => setState(() => _rows.removeAt(i))),
                          ],
                        ),
                        TextField(controller: row.name, style: const TextStyle(color: kInk), decoration: const InputDecoration(labelText: 'Food / meal', labelStyle: TextStyle(color: kMuted))),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Expanded(child: TextField(controller: row.calories, keyboardType: TextInputType.number, style: const TextStyle(color: kInk, fontSize: 12), decoration: const InputDecoration(labelText: 'kcal', labelStyle: TextStyle(color: kMuted, fontSize: 11)))),
                            const SizedBox(width: 6),
                            Expanded(child: TextField(controller: row.protein, keyboardType: TextInputType.number, style: const TextStyle(color: kInk, fontSize: 12), decoration: const InputDecoration(labelText: 'protein', labelStyle: TextStyle(color: kMuted, fontSize: 11)))),
                            const SizedBox(width: 6),
                            Expanded(child: TextField(controller: row.carbs, keyboardType: TextInputType.number, style: const TextStyle(color: kInk, fontSize: 12), decoration: const InputDecoration(labelText: 'carbs', labelStyle: TextStyle(color: kMuted, fontSize: 11)))),
                            const SizedBox(width: 6),
                            Expanded(child: TextField(controller: row.fats, keyboardType: TextInputType.number, style: const TextStyle(color: kInk, fontSize: 12), decoration: const InputDecoration(labelText: 'fats', labelStyle: TextStyle(color: kMuted, fontSize: 11)))),
                          ],
                        ),
                      ],
                    ),
                  );
                }),
                TextButton(onPressed: () => setState(() => _rows.add(_Row())), child: const Text('+ Add meal item', style: TextStyle(color: kGold))),
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
