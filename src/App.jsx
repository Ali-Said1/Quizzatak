import { useState } from 'react';
import { ArrowRight, Brain, Trophy, Star } from 'lucide-react';

export default function QuizApp() {
  



  

  
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <div className="mb-8 flex justify-center">
            <div className="bg-blue-500 bg-opacity-20 p-6 rounded-full border-2 border-blue-400 border-opacity-30">
              <Brain className="w-20 h-20 text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Quiz Master
          </h1>
          
          <p className="text-xl text-blue-200 mb-12 leading-relaxed">
            Test your knowledge and challenge yourself with our exciting quiz. 
            Are you ready to prove your skills?
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center gap-2 text-blue-300">
              <Star className="w-5 h-5" />
              <span>Multiple Topics</span>
            </div>
            <div className="flex items-center gap-2 text-blue-300">
              <Trophy className="w-5 h-5" />
              <span>Track Your Score</span>
            </div>
          </div>
          
          <button
            
            className="group bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg text-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-3 mx-auto shadow-lg shadow-blue-500/50"
          >
            Get Started
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  

  
  
}