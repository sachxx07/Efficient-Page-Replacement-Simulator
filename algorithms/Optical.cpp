// Optimal.cpp
// Usage: ./Optimal <frames> <comma-separated-refs>
// Outputs JSON to stdout

#include <bits/stdc++.h>
using namespace std;

int nextUseIndex(const vector<int>& refs, int current, int page){
    for(int i=current+1;i<refs.size();++i) if(refs[i]==page) return i;
    return INT_MAX;
}

int main(int argc, char** argv){
    if(argc < 3) { cerr << "{\"error\":\"Usage\"}"; return 1; }
    int frames = stoi(argv[1]);
    string refs_s = argv[2];
    vector<int> refs; string token;
    for(char c: refs_s){
        if(c==','){ if(!token.empty()){ refs.push_back(stoi(token)); token.clear(); } }
        else token.push_back(c);
    }
    if(!token.empty()) refs.push_back(stoi(token));

    vector<int> frame(frames, -1);
    int hits=0, misses=0;
    struct Step{ int ref; vector<int> state; string result; int idx; };
    vector<Step> steps;

    for(int i=0;i<refs.size();++i){
        int r = refs[i];
        bool isHit=false;
        for(int f: frame) if(f==r) { isHit=true; break; }
        if(isHit){
            hits++;
            steps.push_back({r, frame, "hit", i});
        } else {
            misses++;
            bool placed=false;
            for(int j=0;j<frames;++j){
                if(frame[j]==-1){
                    frame[j]=r;
                    placed=true;
                    break;
                }
            }
            if(!placed){
                // choose page with farthest next use
                int farIdx = -1;
                int farthest = -1;
                for(int j=0;j<frames;++j){
                    int pg = frame[j];
                    int nu = nextUseIndex(refs, i, pg);
                    if(nu > farthest){
                        farthest = nu;
                        farIdx = j;
                    }
                }
                frame[farIdx] = r;
            }
            steps.push_back({r, frame, "miss", i});
        }
    }

    cout << "{";
    cout << "\"frames\":" << frames << ",";
    cout << "\"sequence\":[";
    for(int i=0;i<refs.size();++i){ if(i) cout<<","; cout<<refs[i]; }
    cout << "],";
    cout << "\"hits\":" << hits << ",";
    cout << "\"misses\":" << misses << ",";
    cout << "\"steps\":[";
    for(int i=0;i<steps.size();++i){
        if(i) cout<<",";
        cout << "{";
        cout << "\"ref\":"<<steps[i].ref<<",";
        cout << "\"idx\":"<<steps[i].idx<<",";
        cout << "\"result\":\""<<steps[i].result<< "\",";
        cout << "\"state\":[";
        for(int j=0;j<frames;++j){ if(j) cout<<","; cout<<steps[i].state[j]; }
        cout << "]}";
    }
    cout << "]";
    cout << "}\n";
    return 0;
}