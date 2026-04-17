import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, Clock, Percent } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Form, FormResponse } from '../lib/types';

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: typeof TrendingUp; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}15` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function MiniBarChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm bg-blue-500 transition-all"
            style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 0)}%`, minHeight: d.count > 0 ? '4px' : '0' }}
          />
        </div>
      ))}
    </div>
  );
}

function SubmissionChart({ responses }: { responses: FormResponse[] }) {
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: d.toISOString().split('T')[0],
      count: 0,
    };
  });

  responses.forEach(r => {
    const date = r.submitted_at.split('T')[0];
    const day = last14.find(d => d.date === date);
    if (day) day.count++;
  });

  const max = Math.max(...last14.map(d => d.count), 1);

  return (
    <div>
      <div className="flex items-end gap-1 h-32">
        {last14.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-full mb-1 bg-gray-800 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
              {d.count} on {d.label}
            </div>
            <div
              className="w-full rounded-t bg-blue-500 hover:bg-blue-600 transition-colors cursor-default"
              style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 2 : 0)}%`, minHeight: d.count > 0 ? '3px' : '0' }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">{last14[0].label}</span>
        <span className="text-xs text-gray-400">{last14[last14.length - 1].label}</span>
      </div>
    </div>
  );
}

function FieldAnalytics({ form, responses }: { form: Form; responses: FormResponse[] }) {
  const choiceFields = form.fields.filter(f =>
    ['radio', 'checkbox', 'dropdown'].includes(f.type)
  );

  if (choiceFields.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Response Breakdown</h3>
      <div className="space-y-6">
        {choiceFields.map(field => {
          const counts: Record<string, number> = {};
          (field.options ?? []).forEach(o => { counts[o] = 0; });
          responses.forEach(r => {
            const val = r.data[field.id];
            if (Array.isArray(val)) {
              val.forEach(v => { counts[String(v)] = (counts[String(v)] ?? 0) + 1; });
            } else if (val) {
              counts[String(val)] = (counts[String(val)] ?? 0) + 1;
            }
          });
          const total = Object.values(counts).reduce((a, b) => a + b, 0);

          return (
            <div key={field.id}>
              <p className="text-xs font-semibold text-gray-600 mb-2">{field.label}</p>
              <div className="space-y-2">
                {Object.entries(counts).map(([opt, count]) => (
                  <div key={opt}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{opt}</span>
                      <span>{count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [formRes, respRes] = await Promise.all([
        supabase.from('forms').select('*').eq('id', id).maybeSingle(),
        supabase.from('form_responses').select('*').eq('form_id', id).order('submitted_at', { ascending: true }),
      ]);
      if (formRes.data) setForm(formRes.data as Form);
      if (respRes.data) setResponses(respRes.data as FormResponse[]);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!form) return null;

  const totalResponses = responses.length;
  const avgTime = totalResponses > 0
    ? Math.round(responses.reduce((s, r) => s + (r.completion_time ?? 0), 0) / totalResponses)
    : 0;

  const inputFieldCount = form.fields.filter(f => !['heading', 'paragraph'].includes(f.type)).length;

  const completionRate = totalResponses > 0 && inputFieldCount > 0
    ? Math.round(
        responses.filter(r => {
          const answered = Object.values(r.data).filter(v => v !== '' && v !== null && v !== undefined).length;
          return answered >= inputFieldCount * 0.8;
        }).length / totalResponses * 100
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{form.title} — Analytics</h1>
              <div className="flex items-center gap-3 mt-0.5">
                <Link to={`/builder/${id}`} className="text-xs text-blue-600 hover:underline">Edit form</Link>
                <span className="text-gray-300">•</span>
                <Link to={`/forms/${id}/responses`} className="text-xs text-blue-600 hover:underline">View responses</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Responses" value={totalResponses} icon={Users} color="#3b82f6" />
          <StatCard label="Total Views" value={form.total_views} icon={TrendingUp} color="#10b981" />
          <StatCard label="Completion Rate" value={`${completionRate}%`} icon={Percent} color="#f59e0b" />
          <StatCard label="Avg. Time (s)" value={avgTime} icon={Clock} color="#8b5cf6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Submissions (Last 14 days)</h3>
            <p className="text-xs text-gray-400 mb-4">{totalResponses} total</p>
            {totalResponses > 0 ? (
              <SubmissionChart responses={responses} />
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-sm text-gray-400">No responses yet</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Form Overview</h3>
            <div className="space-y-3">
              {[
                { label: 'Status', value: form.is_published ? 'Published' : 'Draft' },
                { label: 'Fields', value: `${form.fields.length} fields` },
                { label: 'Created', value: new Date(form.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                { label: 'Last Updated', value: new Date(form.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className="text-xs font-medium text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {totalResponses > 0 && (
          <div className="mt-4">
            <FieldAnalytics form={form} responses={responses} />
          </div>
        )}
      </div>
    </div>
  );
}
