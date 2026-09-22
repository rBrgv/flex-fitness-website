import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../api_client.dart';
import '../main.dart';

const _mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];

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

class TrainerClientDetailScreen extends StatefulWidget {
  final String memberId;
  final String memberName;
  const TrainerClientDetailScreen({super.key, required this.memberId, required this.memberName});

  @override
  State<TrainerClientDetailScreen> createState() => _TrainerClientDetailScreenState();
}

class _TrainerClientDetailScreenState extends State<TrainerClientDetailScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;

  String? _selectedMealTemplate;
  final DateTime _mealStartDate = DateTime.now();
  bool _mealAssigning = false;
  bool _mealEnding = false;
  String? _mealError;

  String? _selectedWorkoutTemplate;
  final DateTime _workoutStartDate = DateTime.now();
  bool _workoutAssigning = false;
  bool _workoutEnding = false;
  String? _workoutError;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await ApiClient.instance.getTrainerClientDetail(widget.memberId);
    setState(() {
      _data = res.ok ? res.data : null;
      _loading = false;
      final templates = (_data?['templates'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final workoutTemplates = (_data?['workout_templates'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      _selectedMealTemplate ??= templates.isNotEmpty ? templates.first['id'] as String : null;
      _selectedWorkoutTemplate ??= workoutTemplates.isNotEmpty ? workoutTemplates.first['id'] as String : null;
    });
  }

  String _fmt(String date) => date;

  Future<void> _assignMeal() async {
    setState(() {
      _mealError = null;
    });
    if (_selectedMealTemplate == null) return setState(() => _mealError = 'Pick a template first.');
    setState(() => _mealAssigning = true);
    final res = await ApiClient.instance.assignMealPlan(widget.memberId, _selectedMealTemplate!, DateFormat('yyyy-MM-dd').format(_mealStartDate));
    setState(() => _mealAssigning = false);
    if (!res.ok) return setState(() => _mealError = res.error ?? 'Could not assign the plan.');
    _load();
  }

  Future<void> _endMeal() async {
    final id = _data?['active_assignment']?['id'];
    if (id == null) return;
    setState(() => _mealEnding = true);
    final res = await ApiClient.instance.endMealPlanAssignment(id);
    setState(() => _mealEnding = false);
    if (!res.ok) return setState(() => _mealError = res.error ?? 'Could not end the plan.');
    _load();
  }

  Future<void> _assignWorkout() async {
    setState(() {
      _workoutError = null;
    });
    if (_selectedWorkoutTemplate == null) return setState(() => _workoutError = 'Pick a template first.');
    setState(() => _workoutAssigning = true);
    final res = await ApiClient.instance.assignWorkoutPlan(widget.memberId, _selectedWorkoutTemplate!, DateFormat('yyyy-MM-dd').format(_workoutStartDate));
    setState(() => _workoutAssigning = false);
    if (!res.ok) return setState(() => _workoutError = res.error ?? 'Could not assign the plan.');
    _load();
  }

  Future<void> _endWorkout() async {
    final id = _data?['active_workout_assignment']?['id'];
    if (id == null) return;
    setState(() => _workoutEnding = true);
    final res = await ApiClient.instance.endWorkoutPlanAssignment(id);
    setState(() => _workoutEnding = false);
    if (!res.ok) return setState(() => _workoutError = res.error ?? 'Could not end the plan.');
    _load();
  }

  Map<String, List<Map<String, dynamic>>> _groupMeal(List items) {
    final groups = <String, List<Map<String, dynamic>>>{};
    for (final item in items.cast<Map<String, dynamic>>()) {
      (groups[item['meal_type']] ??= []).add(item);
    }
    return groups;
  }

  List<MapEntry<String, List<Map<String, dynamic>>>> _groupDay(List exercises) {
    final groups = <String, List<Map<String, dynamic>>>{};
    final order = <String>[];
    for (final ex in exercises.cast<Map<String, dynamic>>()) {
      final day = ex['day_label'] as String;
      if (!groups.containsKey(day)) {
        groups[day] = [];
        order.add(day);
      }
      groups[day]!.add(ex);
    }
    return order.map((d) => MapEntry(d, groups[d]!)).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.memberName)),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kGold))
          : _data == null
              ? const Center(child: Text('Could not load this client.', style: TextStyle(color: kMuted)))
              : RefreshIndicator(onRefresh: _load, color: kGold, child: _buildBody()),
    );
  }

  Widget _buildBody() {
    final activeAssignment = _data!['active_assignment'] as Map<String, dynamic>?;
    final templates = (_data!['templates'] as List).cast<Map<String, dynamic>>();
    final activeWorkoutAssignment = _data!['active_workout_assignment'] as Map<String, dynamic>?;
    final workoutTemplates = (_data!['workout_templates'] as List).cast<Map<String, dynamic>>();
    final logs = (_data!['logs'] as List).cast<Map<String, dynamic>>();
    final photos = (_data!['photos'] as List).cast<Map<String, dynamic>>();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Diet plan
        _card(
          title: 'Diet Plan',
          trailing: activeAssignment != null
              ? TextButton(onPressed: _mealEnding ? null : _endMeal, child: Text(_mealEnding ? 'Ending…' : 'End plan', style: const TextStyle(color: kMuted)))
              : null,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (activeAssignment?['plan'] != null) ...[
                Text(activeAssignment!['plan']['title'], style: const TextStyle(color: kInk, fontWeight: FontWeight.bold, fontSize: 15)),
                Text('Since ${_fmt(activeAssignment['start_date'])}', style: const TextStyle(color: kMuted, fontSize: 12)),
                const SizedBox(height: 8),
                ..._mealOrder.where((t) => _groupMeal(activeAssignment['plan']['meal_plan_items']).containsKey(t)).map((mealType) {
                  final items = _groupMeal(activeAssignment['plan']['meal_plan_items'])[mealType]!;
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(mealType.toUpperCase(), style: const TextStyle(color: kGold, fontSize: 11, fontWeight: FontWeight.bold)),
                        ...items.map((i) => Text('${i['name']}${i['calories'] != null ? ' — ${i['calories']} kcal' : ''}', style: const TextStyle(color: kInk, fontSize: 13))),
                      ],
                    ),
                  );
                }),
              ] else
                const Text('No active plan.', style: TextStyle(color: kMuted, fontSize: 13)),
              const Divider(color: kLine, height: 24),
              const Text('ASSIGN A PLAN', style: TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: _selectedMealTemplate,
                dropdownColor: kPanel,
                style: const TextStyle(color: kInk),
                items: templates.map((t) => DropdownMenuItem(value: t['id'] as String, child: Text(t['title']))).toList(),
                onChanged: (v) => setState(() => _selectedMealTemplate = v),
              ),
              if (_mealError != null) Padding(padding: const EdgeInsets.only(top: 6), child: Text(_mealError!, style: const TextStyle(color: Colors.redAccent, fontSize: 12))),
              const SizedBox(height: 8),
              ElevatedButton(onPressed: _mealAssigning ? null : _assignMeal, child: Text(_mealAssigning ? 'Assigning…' : 'Assign')),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Workout plan
        _card(
          title: 'Workout Plan',
          trailing: activeWorkoutAssignment != null
              ? TextButton(onPressed: _workoutEnding ? null : _endWorkout, child: Text(_workoutEnding ? 'Ending…' : 'End plan', style: const TextStyle(color: kMuted)))
              : null,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (activeWorkoutAssignment?['plan'] != null) ...[
                Text(activeWorkoutAssignment!['plan']['title'], style: const TextStyle(color: kInk, fontWeight: FontWeight.bold, fontSize: 15)),
                Text('Since ${_fmt(activeWorkoutAssignment['start_date'])}', style: const TextStyle(color: kMuted, fontSize: 12)),
                const SizedBox(height: 8),
                ..._groupDay(activeWorkoutAssignment['plan']['workout_plan_exercises']).map((entry) => Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(entry.key.toUpperCase(), style: const TextStyle(color: kGold, fontSize: 11, fontWeight: FontWeight.bold)),
                          ...entry.value.map((ex) {
                            final parts = <String>[];
                            if (ex['sets'] != null) parts.add('${ex['sets']} sets');
                            if (ex['reps'] != null) parts.add('${ex['reps']} reps');
                            return Text('${ex['name']}${parts.isNotEmpty ? ' — ${parts.join(' · ')}' : ''}', style: const TextStyle(color: kInk, fontSize: 13));
                          }),
                        ],
                      ),
                    )),
              ] else
                const Text('No active plan.', style: TextStyle(color: kMuted, fontSize: 13)),
              const Divider(color: kLine, height: 24),
              const Text('ASSIGN A PLAN', style: TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: _selectedWorkoutTemplate,
                dropdownColor: kPanel,
                style: const TextStyle(color: kInk),
                items: workoutTemplates.map((t) => DropdownMenuItem(value: t['id'] as String, child: Text(t['title']))).toList(),
                onChanged: (v) => setState(() => _selectedWorkoutTemplate = v),
              ),
              if (_workoutError != null) Padding(padding: const EdgeInsets.only(top: 6), child: Text(_workoutError!, style: const TextStyle(color: Colors.redAccent, fontSize: 12))),
              const SizedBox(height: 8),
              ElevatedButton(onPressed: _workoutAssigning ? null : _assignWorkout, child: Text(_workoutAssigning ? 'Assigning…' : 'Assign')),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Progress — measurements (read-only)
        _card(
          title: 'Progress — Measurements',
          child: logs.isEmpty
              ? const Text('No entries logged yet.', style: TextStyle(color: kMuted, fontSize: 13))
              : Column(
                  children: logs.map((log) {
                    final parts = <String>[];
                    for (final f in _measurementFields) {
                      if (log[f[0]] != null) parts.add('${f[1]}: ${log[f[0]]}${f[2]}');
                    }
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: kPaper, borderRadius: BorderRadius.circular(8), border: Border.all(color: kLine)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(log['log_date'], style: const TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold)),
                          Wrap(spacing: 10, children: parts.map((p) => Text(p, style: const TextStyle(color: kInk, fontSize: 12))).toList()),
                        ],
                      ),
                    );
                  }).toList(),
                ),
        ),
        const SizedBox(height: 12),

        // Progress — photos (read-only)
        _card(
          title: 'Progress — Photos',
          child: photos.isEmpty
              ? const Text('No photos uploaded yet.', style: TextStyle(color: kMuted, fontSize: 13))
              : GridView.count(
                  crossAxisCount: 3,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 6,
                  mainAxisSpacing: 6,
                  children: photos.map((p) => ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(p['url'], fit: BoxFit.cover),
                      )).toList(),
                ),
        ),
      ],
    );
  }

  Widget _card({required String title, required Widget child, Widget? trailing}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: kPanel, borderRadius: BorderRadius.circular(16), border: Border.all(color: kLine)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title.toUpperCase(), style: const TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
              ?trailing,
            ],
          ),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}
