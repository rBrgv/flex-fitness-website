import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../api_client.dart';
import '../main.dart';

const _mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];

class NutritionScreen extends StatefulWidget {
  const NutritionScreen({super.key});

  @override
  State<NutritionScreen> createState() => _NutritionScreenState();
}

class _NutritionScreenState extends State<NutritionScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await ApiClient.instance.getNutrition();
    setState(() {
      _data = res.ok ? res.data : null;
      _loading = false;
    });
  }

  Map<String, List<Map<String, dynamic>>> _grouped(List items) {
    final groups = <String, List<Map<String, dynamic>>>{};
    for (final item in items.cast<Map<String, dynamic>>()) {
      (groups[item['meal_type']] ??= []).add(item);
    }
    return groups;
  }

  @override
  Widget build(BuildContext context) {
    final plan = _data?['plan'] as Map<String, dynamic>?;

    return Scaffold(
      appBar: AppBar(title: const Text('My Diet Plan')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kGold))
          : plan == null
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Text('No diet plan assigned yet — check with your trainer.', style: TextStyle(color: kMuted), textAlign: TextAlign.center),
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
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(plan['title'], style: const TextStyle(color: kInk, fontSize: 18, fontWeight: FontWeight.bold)),
                            if (_data!['start_date'] != null)
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text('Since ${DateFormat('d MMM yyyy').format(DateTime.parse(_data!['start_date']))}', style: const TextStyle(color: kMuted, fontSize: 13)),
                              ),
                            if (_data!['totals'] != null)
                              Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Text(
                                  'Daily total: ${_data!['totals']['calories']} kcal · P ${_data!['totals']['protein_g']}g · C ${_data!['totals']['carbs_g']}g · F ${_data!['totals']['fats_g']}g',
                                  style: const TextStyle(color: kMuted, fontSize: 13),
                                ),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      ..._mealOrder.where((t) => _grouped(plan['items']).containsKey(t)).map((mealType) {
                        final items = _grouped(plan['items'])[mealType]!;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: kPanel, borderRadius: BorderRadius.circular(16), border: Border.all(color: kLine)),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(mealType.toUpperCase(), style: const TextStyle(color: kGold, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
                              const SizedBox(height: 8),
                              ...items.map((item) => Padding(
                                    padding: const EdgeInsets.only(bottom: 6),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(child: Text(item['name'], style: const TextStyle(color: kInk, fontSize: 14))),
                                        if (item['calories'] != null) Text('${item['calories']} kcal', style: const TextStyle(color: kMuted, fontSize: 12)),
                                      ],
                                    ),
                                  )),
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
