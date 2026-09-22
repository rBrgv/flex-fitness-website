import 'package:flutter/material.dart';

import '../api_client.dart';
import '../main.dart';
import 'trainer_client_detail_screen.dart';

class TrainerClientsScreen extends StatefulWidget {
  const TrainerClientsScreen({super.key});

  @override
  State<TrainerClientsScreen> createState() => _TrainerClientsScreenState();
}

class _TrainerClientsScreenState extends State<TrainerClientsScreen> {
  List<Map<String, dynamic>> _members = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await ApiClient.instance.getTrainerClients();
    setState(() {
      _members = res.ok ? (res.data['members'] as List).cast<Map<String, dynamic>>() : [];
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Clients')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kGold))
          : RefreshIndicator(
              onRefresh: _load,
              color: kGold,
              child: _members.isEmpty
                  ? ListView(
                      children: const [
                        Padding(
                          padding: EdgeInsets.all(24),
                          child: Text('No members assigned to you right now.', style: TextStyle(color: kMuted)),
                        ),
                      ],
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _members.length,
                      itemBuilder: (context, i) {
                        final m = _members[i];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => TrainerClientDetailScreen(memberId: m['id'], memberName: m['name']))),
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(color: kPanel, borderRadius: BorderRadius.circular(16), border: Border.all(color: kLine)),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(m['name'], style: const TextStyle(color: kInk, fontWeight: FontWeight.bold, fontSize: 15)),
                                      Text(m['phone'], style: const TextStyle(color: kMuted, fontSize: 12)),
                                    ],
                                  ),
                                  Text((m['status'] as String).toUpperCase(), style: const TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold)),
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
