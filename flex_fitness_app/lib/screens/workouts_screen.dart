import 'package:flutter/material.dart';

import '../api_client.dart';
import '../main.dart';

class WorkoutsScreen extends StatefulWidget {
  const WorkoutsScreen({super.key});

  @override
  State<WorkoutsScreen> createState() => _WorkoutsScreenState();
}

class _WorkoutsScreenState extends State<WorkoutsScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await ApiClient.instance.getWorkouts();
    setState(() {
      _data = res.ok ? res.data : null;
      _loading = false;
    });
  }

  List<MapEntry<String, List<Map<String, dynamic>>>> _grouped(List exercises) {
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
    return order.map((day) => MapEntry(day, groups[day]!)).toList();
  }

  @override
  Widget build(BuildContext context) {
    final plan = _data?['plan'] as Map<String, dynamic>?;

    return Scaffold(
      appBar: AppBar(title: const Text('My Workout Plan')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kGold))
          : plan == null
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Text('No workout plan assigned yet — check with your trainer.', style: TextStyle(color: kMuted), textAlign: TextAlign.center),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  color: kGold,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: kPanel, borderRadius: BorderRadius.circular(16), border: Border.all(color: kLine)),
                        child: Text(plan['title'], style: const TextStyle(color: kInk, fontSize: 18, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(height: 12),
                      ..._grouped(plan['exercises']).map((entry) {
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: kPanel, borderRadius: BorderRadius.circular(16), border: Border.all(color: kLine)),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(entry.key.toUpperCase(), style: const TextStyle(color: kGold, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
                              const SizedBox(height: 8),
                              ...entry.value.map((ex) {
                                final parts = <String>[];
                                if (ex['sets'] != null) parts.add('${ex['sets']} sets');
                                if (ex['reps'] != null) parts.add('${ex['reps']} reps');
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 6),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(child: Text(ex['name'], style: const TextStyle(color: kInk, fontSize: 14))),
                                      if (parts.isNotEmpty) Text(parts.join(' · '), style: const TextStyle(color: kMuted, fontSize: 12)),
                                    ],
                                  ),
                                );
                              }),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
    );
  }
}
