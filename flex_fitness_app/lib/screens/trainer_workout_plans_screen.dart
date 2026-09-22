import 'package:flutter/material.dart';

import '../api_client.dart';
import '../main.dart';
import 'workout_plan_editor_screen.dart';

class TrainerWorkoutPlansScreen extends StatefulWidget {
  const TrainerWorkoutPlansScreen({super.key});

  @override
  State<TrainerWorkoutPlansScreen> createState() => _TrainerWorkoutPlansScreenState();
}

class _TrainerWorkoutPlansScreenState extends State<TrainerWorkoutPlansScreen> {
  List<Map<String, dynamic>> _plans = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await ApiClient.instance.getWorkoutPlans();
    setState(() {
      _plans = res.ok ? (res.data['plans'] as List).cast<Map<String, dynamic>>() : [];
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Workout Plan Templates'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () async {
              await Navigator.of(context).push(MaterialPageRoute(builder: (_) => const WorkoutPlanEditorScreen()));
              _load();
            },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kGold))
          : RefreshIndicator(
              onRefresh: _load,
              color: kGold,
              child: _plans.isEmpty
                  ? ListView(children: const [Padding(padding: EdgeInsets.all(24), child: Text('No templates yet — create one.', style: TextStyle(color: kMuted)))])
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _plans.length,
                      itemBuilder: (context, i) {
                        final p = _plans[i];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () async {
                              await Navigator.of(context).push(MaterialPageRoute(builder: (_) => WorkoutPlanEditorScreen(planId: p['id'])));
                              _load();
                            },
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(color: kPanel, borderRadius: BorderRadius.circular(16), border: Border.all(color: kLine)),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(p['title'], style: const TextStyle(color: kInk, fontWeight: FontWeight.bold, fontSize: 15)),
                                  if (p['goal_type'] != null) Text(p['goal_type'], style: const TextStyle(color: kMuted, fontSize: 12)),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
