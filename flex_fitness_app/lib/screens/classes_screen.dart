import 'package:flutter/material.dart';

import '../api_client.dart';
import '../main.dart';

class ClassesScreen extends StatefulWidget {
  const ClassesScreen({super.key});

  @override
  State<ClassesScreen> createState() => _ClassesScreenState();
}

class _ClassesScreenState extends State<ClassesScreen> {
  List<Map<String, dynamic>> _classes = [];
  bool _enabled = true;
  bool _loading = true;
  String? _pendingKey;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await ApiClient.instance.getBookableClasses();
    setState(() {
      _enabled = res.ok ? (res.data['enabled'] != false) : true;
      _classes = res.ok ? (res.data['classes'] as List).cast<Map<String, dynamic>>() : [];
      _loading = false;
    });
  }

  String _fmtTime(String hhmm) {
    final parts = hhmm.split(':');
    final h = int.parse(parts[0]);
    final m = parts[1];
    final period = h >= 12 ? 'PM' : 'AM';
    final h12 = h % 12 == 0 ? 12 : h % 12;
    return '$h12:$m $period';
  }

  Future<void> _book(Map<String, dynamic> cls) async {
    final key = '${cls['class_id']}:${cls['date']}';
    setState(() {
      _pendingKey = key;
      _error = null;
    });
    final res = await ApiClient.instance.bookClass(cls['class_id'], cls['date']);
    setState(() => _pendingKey = null);
    if (!res.ok) {
      setState(() => _error = res.error ?? 'Could not book that class.');
      return;
    }
    _load();
  }

  Future<void> _cancel(Map<String, dynamic> cls) async {
    final key = '${cls['class_id']}:${cls['date']}';
    setState(() {
      _pendingKey = key;
      _error = null;
    });
    final res = await ApiClient.instance.cancelClass(cls['class_id'], cls['date']);
    setState(() => _pendingKey = null);
    if (!res.ok) {
      setState(() => _error = res.error ?? 'Could not cancel that booking.');
      return;
    }
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Book a Class')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kGold))
          : !_enabled
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Text('Class booking is temporarily unavailable — please message us on WhatsApp instead.', style: TextStyle(color: kMuted), textAlign: TextAlign.center),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  color: kGold,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      if (_error != null) Padding(padding: const EdgeInsets.only(bottom: 8), child: Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 13))),
                      if (_classes.isEmpty)
                        const Text('No upcoming classes with availability right now.', style: TextStyle(color: kMuted))
                      else
                        ..._classes.map((cls) {
                          final key = '${cls['class_id']}:${cls['date']}';
                          final isPending = _pendingKey == key;
                          final alreadyBooked = cls['already_booked'] == true;
                          final spotsLeft = cls['spots_left'] as int;
                          final isFull = spotsLeft <= 0 && !alreadyBooked;
                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(color: kPanel, borderRadius: BorderRadius.circular(16), border: Border.all(color: kLine)),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(cls['name'], style: const TextStyle(color: kInk, fontWeight: FontWeight.bold, fontSize: 14)),
                                      Text('${cls['day']} ${cls['date']} · ${_fmtTime(cls['start_time'])}–${_fmtTime(cls['end_time'])}', style: const TextStyle(color: kMuted, fontSize: 12)),
                                      if (!alreadyBooked) Text(isFull ? 'Full' : '$spotsLeft spots left', style: const TextStyle(color: kMuted, fontSize: 12)),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                if (alreadyBooked)
                                  OutlinedButton(
                                    onPressed: isPending ? null : () => _cancel(cls),
                                    child: Text(isPending ? 'Cancelling…' : 'Cancel'),
                                  )
                                else
                                  ElevatedButton(
                                    onPressed: (isPending || isFull) ? null : () => _book(cls),
                                    child: Text(isPending ? 'Booking…' : (isFull ? 'Full' : 'Book')),
                                  ),
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
